from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import logging
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import (
    Company, Driver, ContactMessage, SiteSettings, 
    ActivityLog, UserSession, SecuritySettings, LoginAttempt
)
from .serializers import (
    CompanySerializer, CompanyUpdateSerializer, CompanyUserSerializer, DriverSerializer, ContactMessageSerializer, 
    SiteSettingsSerializer, LoginSerializer, PasswordChangeSerializer,
    UserProfileUpdateSerializer, ActivityLogSerializer
)

logger = logging.getLogger(__name__)

# Security Middleware Functions
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def log_activity(request, action, details=None, user=None):
    """Log user activity for security monitoring"""
    try:
        ActivityLog.objects.create(
            user=user or request.user if request.user.is_authenticated else None,
            action=action,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details=details or {},
            session_id=request.session.session_key if request.session else None
        )
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")

def check_login_attempts(username, ip_address):
    """Check if user is locked out due to too many failed attempts"""
    from datetime import timedelta
    
    # New: 20 attempts per 1 hour
    max_attempts = 20
    lockout_duration = 3600  # 1 hour in seconds
    
    # Count recent failed attempts
    recent_attempts = LoginAttempt.objects.filter(
        username=username,
        ip_address=ip_address,
        success=False,
        timestamp__gte=timezone.now() - timedelta(hours=1)
    ).count()
    
    return recent_attempts >= max_attempts

def record_login_attempt(username, ip_address, user_agent, success, user=None):
    """Record login attempt for security monitoring"""
    LoginAttempt.objects.create(
        user=user,
        username=username,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success
    )

# Custom JWT Login View for frontend compatibility
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        # Log the request data for debugging
        logger.info(f"Login attempt with data: {request.data}")
        
        # Extract username and password from request
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'detail': 'Username and password is required.',
                'code': 'missing_credentials',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check if user is locked out
        if check_login_attempts(username, ip_address):
            return Response({
                'detail': 'Your account has been locked for one hour due to too many failed attempts. Please try again later.',
                'code': 'too_many_attempts',
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Try to get user object
        user_obj = User.objects.filter(username=username).first()
        user = authenticate(username=username, password=password)
        
        if user is not None:
            # Record successful login
            record_login_attempt(username, ip_address, user_agent, True, user)
            
            # Log activity
            log_activity(request, 'login', {
                'username': username,
                'method': 'jwt'
            }, user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Set token expiration to 5 days
            access_token.set_exp(lifetime=timezone.timedelta(days=5))
            
            # Create or update user session
            session_key = request.session.session_key
            if session_key:
                UserSession.objects.update_or_create(
                    session_key=session_key,
                    defaults={
                        'user': user,
                        'ip_address': ip_address,
                        'user_agent': user_agent,
                        'is_active': True
                    }
                )
            
            logger.info(f"Successful login for user: {username}")
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_company': hasattr(user, 'company_profile'),
                    'is_driver': hasattr(user, 'driver_profile'),
                    'is_manager': user.is_staff or user.is_superuser,
                    'is_staff': user.is_staff,
                }
            })
        else:
            # Record failed login attempt (even if user does not exist)
            record_login_attempt(username, ip_address, user_agent, False, user_obj)
            
            # Improved error message
            if not user_obj:
                logger.warning(f"Login attempt with non-existent username: {username}")
                return Response({
                    'detail': 'The entered username does not exist.',
                    'code': 'user_not_found',
                }, status=status.HTTP_401_UNAUTHORIZED)
            else:
                logger.warning(f"Failed login attempt for user: {username}")
                return Response({
                    'detail': 'The password is incorrect. Please try again.',
                    'code': 'invalid_password',
                }, status=status.HTTP_401_UNAUTHORIZED)

# Test view to verify endpoint is accessible
class TestLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        return Response({
            'message': 'Login endpoint is working',
            'data': request.data
        })

# Test view for company registration
class TestCompanyRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.info(f"Test registration endpoint called with data: {request.data}")
        return Response({
            'message': 'Company registration endpoint is accessible',
            'received_data': request.data,
            'data_structure': {
                'has_user': 'user' in request.data,
                'user_fields': list(request.data.get('user', {}).keys()) if 'user' in request.data else [],
                'company_fields': [k for k in request.data.keys() if k != 'user']
            }
        })

# Test view for profile photo upload
class TestPhotoUploadView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.info(f"Test photo upload endpoint called")
        logger.info(f"Files: {request.FILES}")
        logger.info(f"Data: {request.data}")
        return Response({
            'message': 'Photo upload test endpoint',
            'files': list(request.FILES.keys()) if request.FILES else [],
            'data': request.data
        })

# Authentication Views
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print(f"LoginView - Login attempt with data: {request.data}")
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            print(f"LoginView - Attempting login for username: {username}")
            
            # Check if user is locked out
            if check_login_attempts(username, ip_address):
                print(f"LoginView - User {username} is locked out")
                return Response({
                    'detail': 'اکانت شما به دلیل تلاش ناموفق زیاد، به مدت یک ساعت قفل شد. لطفاً بعداً دوباره تلاش کنید.',
                    'code': 'too_many_attempts',
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Try to get user object - check both username and email
            user_obj = User.objects.filter(username=username).first()
            if not user_obj:
                # If not found by username, try email
                user_obj = User.objects.filter(email=username).first()
                if user_obj:
                    print(f"LoginView - User found by email: {user_obj.username}")
                    username = user_obj.username  # Use the actual username for authentication
            
            print(f"LoginView - User object found: {user_obj is not None}")
            if user_obj:
                print(f"LoginView - User ID: {user_obj.id}, Username: {user_obj.username}, Email: {user_obj.email}, Is active: {user_obj.is_active}")
            
            user = authenticate(username=username, password=password)
            print(f"LoginView - Authentication result: {user is not None}")
            
            if user is not None:
                print(f"LoginView - Login successful for user: {username}")
                # Record successful login
                record_login_attempt(username, ip_address, user_agent, True, user)
                
                # Log activity
                log_activity(request, 'login', {
                    'username': username,
                    'method': 'password'
                }, user)
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                # Set token expiration to 5 days
                access_token.set_exp(lifetime=timezone.timedelta(days=5))
                
                # Create or update user session
                session_key = request.session.session_key
                if session_key:
                    UserSession.objects.update_or_create(
                        session_key=session_key,
                        defaults={
                            'user': user,
                            'ip_address': ip_address,
                            'user_agent': user_agent,
                            'is_active': True
                        }
                    )
                
                return Response({
                    'access': str(access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_company': hasattr(user, 'company_profile'),
                        'is_driver': hasattr(user, 'driver_profile'),
                        'is_manager': user.is_staff or user.is_superuser,
                        'is_staff': user.is_staff,
                    }
                })
            else:
                print(f"LoginView - Login failed for user: {username}")
                # Record failed login attempt (even if user does not exist)
                record_login_attempt(username, ip_address, user_agent, False, user_obj)
                
                # Improved error message
                if not user_obj:
                    print(f"LoginView - User {username} does not exist")
                    return Response({
                        'detail': 'The entered username does not exist.',
                        'code': 'user_not_found',
                    }, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    print(f"LoginView - Password incorrect for user {username}")
                    return Response({
                        'detail': 'The password is incorrect. Please try again.',
                        'code': 'invalid_password',
                    }, status=status.HTTP_401_UNAUTHORIZED)
        
        print(f"LoginView - Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Log activity
            log_activity(request, 'logout', {
                'session_id': request.session.session_key
            })
            
            # Invalidate session
            if request.session:
                session_key = request.session.session_key
                UserSession.objects.filter(session_key=session_key).update(is_active=False)
                request.session.flush()
            
            return Response({'detail': 'Successfully logged out.'})
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return Response({'detail': 'Logout failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        print(f"PasswordChangeView - Request from user: {request.user.username}")
        print(f"PasswordChangeView - Request data: {request.data}")
        
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            print(f"PasswordChangeView - Validated data: old_password={'***' if old_password else 'None'}, new_password={'***' if new_password else 'None'}")
            
            # Check old password
            if not user.check_password(old_password):
                print(f"PasswordChangeView - Old password check failed for user: {user.username}")
                return Response({
                    'detail': 'Current password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"PasswordChangeView - Old password check passed, changing password...")
            
            # Change password
            user.set_password(new_password)
            user.save()
            
            print(f"PasswordChangeView - Password changed successfully for user: {user.username}")
            
            # Update security settings
            security_settings, created = SecuritySettings.objects.get_or_create(user=user)
            security_settings.last_password_change = timezone.now()
            security_settings.save()
            
            # Log activity
            log_activity(request, 'password_change', {
                'password_changed_at': timezone.now().isoformat()
            })
            
            return Response({'detail': 'Password changed successfully.'})
        else:
            print(f"PasswordChangeView - Serializer errors: {serializer.errors}")
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_company': hasattr(user, 'company_profile'),
            'is_driver': hasattr(user, 'driver_profile'),
            'is_manager': user.is_staff or user.is_superuser,
            'is_staff': user.is_staff,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        })
    
    def patch(self, request):
        """Update user profile"""
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Log activity
            log_activity(request, 'profile_update', {
                'updated_fields': list(request.data.keys())
            })
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivityLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's activity log"""
        activities = ActivityLog.objects.filter(user=request.user).order_by('-timestamp')[:50]
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data)

class SecurityStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get security status and settings"""
        user = request.user
        security_settings, created = SecuritySettings.objects.get_or_create(user=user)
        
        # Get recent login attempts
        recent_attempts = LoginAttempt.objects.filter(
            username=user.username
        ).order_by('-timestamp')[:10]
        
        # Get active sessions
        active_sessions = UserSession.objects.filter(
            user=user,
            is_active=True
        ).order_by('-last_activity')
        
        return Response({
            'security_settings': {
                'two_factor_enabled': security_settings.two_factor_enabled,
                'login_notifications': security_settings.login_notifications,
                'session_timeout': security_settings.session_timeout,
                'max_login_attempts': security_settings.max_login_attempts,
                'last_password_change': security_settings.last_password_change,
            },
            'recent_login_attempts': [
                {
                    'timestamp': attempt.timestamp,
                    'ip_address': attempt.ip_address,
                    'success': attempt.success,
                    'user_agent': attempt.user_agent[:100] + '...' if len(attempt.user_agent) > 100 else attempt.user_agent
                }
                for attempt in recent_attempts
            ],
            'active_sessions': [
                {
                    'created_at': session.created_at,
                    'last_activity': session.last_activity,
                    'ip_address': session.ip_address,
                    'user_agent': session.user_agent[:100] + '...' if len(session.user_agent) > 100 else session.user_agent
                }
                for session in active_sessions
            ]
        })

# Existing Views (Updated with Security)
class CompanyRegisterView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        try:
            # Log the incoming request data for debugging
            logger.info(f"Company registration attempt with data: {request.data}")
            
            # Create the company using the serializer
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                company = serializer.save()
                
                # Log the successful registration
                log_activity(request, 'register', {
                    'user_type': 'company',
                    'company_name': company.company_name,
                    'user_id': company.user.id
                }, company.user)
                
                logger.info(f"Company registration successful: {company.company_name} (User ID: {company.user.id})")
                
                return Response({
                    'detail': 'Company registered successfully.',
                    'company': {
                        'id': company.id,
                        'company_name': company.company_name,
                        'manager_full_name': company.manager_full_name,
                        'user_id': company.user.id
                    }
                }, status=status.HTTP_201_CREATED)
                
        except serializers.ValidationError as e:
            logger.error(f"Company registration validation error: {e}")
            return Response({
                'detail': 'Validation failed.',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Company registration error: {e}")
            return Response({
                'detail': 'Registration failed. Please try again.',
                'code': 'registration_failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DriverRegisterView(generics.CreateAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        with transaction.atomic():
            driver = serializer.save()
            log_activity(self.request, 'register', {
                'user_type': 'driver',
                'driver_name': driver.full_name
            }, driver.user)

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        message = serializer.save()
        log_activity(self.request, 'contact_message', {
            'message_id': message.id,
            'subject': message.subject
        })

class CompanyMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            company = request.user.company_profile
            log_activity(request, 'dashboard_access', {
                'section': 'company_profile'
            })
        except Company.DoesNotExist:
            return Response({'detail': 'Company profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def patch(self, request):
        try:
            company = request.user.company_profile
        except Company.DoesNotExist:
            return Response({'detail': 'Company profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Log the incoming request data for debugging
        logger.info(f"Company profile update attempt with data: {request.data}")
        logger.info(f"Files in request: {request.FILES}")
        
        # Use the update serializer for PATCH requests
        serializer = CompanyUpdateSerializer(company, data=request.data, partial=True)
        
        if serializer.is_valid():
            try:
                serializer.save()
                log_activity(request, 'profile_update', {
                    'section': 'company_profile',
                    'updated_fields': list(request.data.keys())
                })
                
                # Return the updated data using the update serializer for consistent response format
                response_serializer = CompanyUpdateSerializer(company)
                return Response(response_serializer.data)
                
            except Exception as e:
                logger.error(f"Error saving company profile: {e}")
                return Response({
                    'detail': 'Failed to update profile. Please try again.',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error(f"Company profile update validation errors: {serializer.errors}")
            return Response({
                'detail': 'Validation failed.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class DriverListView(generics.ListAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        log_activity(request, 'dashboard_access', {
            'section': 'driver_list'
        })
        return super().get(request, *args, **kwargs)

class DriverDetailView(generics.RetrieveAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]

class SiteSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)
    def patch(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_activity(request, 'profile_update', {
                'section': 'site_settings',
                'updated_fields': list(request.data.keys())
            })
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportTicketListCreateView(generics.ListCreateAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ادمین همه تیکت‌ها را می‌بیند، کاربر فقط تیکت‌های خودش را
        user = self.request.user
        if user.is_staff:
            return ContactMessage.objects.all().order_by('-created_at')
        return ContactMessage.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        message = serializer.save(user=self.request.user, name=self.request.user.get_full_name() or self.request.user.username, email=self.request.user.email)
        log_activity(self.request, 'contact_message', {
            'message_id': message.id,
            'subject': message.subject
        })

class SupportTicketReplyView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        try:
            ticket = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({'detail': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)
        reply = request.data.get('reply')
        if not reply:
            return Response({'detail': 'Reply is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ticket.reply = reply
        ticket.status = 'answered'
        from django.utils import timezone
        ticket.answered_at = timezone.now()
        ticket.save()
        log_activity(request, 'admin_action', {
            'action': 'ticket_reply',
            'ticket_id': ticket.id
        })
        return Response(ContactMessageSerializer(ticket).data)

# Security Middleware View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth_status(request):
    """Check if user is still authenticated and session is valid"""
    return Response({
        'authenticated': True,
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        },
        'session_valid': request.session and request.session.session_key,
        'timestamp': timezone.now().isoformat()
    })

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print(f"UserListView - Request from user: {user.username}")
        
        # فقط ادمین یا مدیر (کسی که company_profile دارد)
        if not (user.is_staff or hasattr(user, 'company_profile')):
            print(f"UserListView - Permission denied for user: {user.username}")
            return Response({'detail': 'Permission denied.'}, status=403)
        
        users = User.objects.all().order_by('-date_joined')
        print(f"UserListView - Found {users.count()} users in database")
        
        data = []
        for u in users:
            company = getattr(u, 'company_profile', None)
            
            # Get full_name from company profile first, then from user's first_name + last_name
            full_name = None
            if company and company.manager_full_name:
                full_name = company.manager_full_name
            else:
                full_name = f"{u.first_name} {u.last_name}".strip() or u.username
            
            user_data = {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'full_name': full_name,
                'phone': getattr(company, 'phone', '') if company else '',
                'company_name': getattr(company, 'company_name', '') if company else '',
                'is_staff': u.is_staff,
                'is_superuser': u.is_superuser,
                'is_manager': company is not None,
                'date_joined': u.date_joined,
                'profile_photo': company.profile_photo.url if company and company.profile_photo else None,
            }
            data.append(user_data)
            print(f"UserListView - User {u.id}: {u.username} - {full_name} - Company: {getattr(company, 'company_name', 'None')}")
        
        print(f"UserListView - Returning {len(data)} users")
        return Response(data)

class UserRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        user = request.user
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'detail': 'User not found.'}, status=404)
        role = request.data.get('role')
        if role == 'admin':
            target.is_staff = True
        elif role == 'user':
            target.is_staff = False
        target.save()
        return Response({'detail': 'Role updated.'})

class AllMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)
        contacts = ContactMessage.objects.all().order_by('-created_at')
        tickets = ContactMessage.objects.all().order_by('-created_at')
        # اگر مدل ticket جداست، آن را هم اضافه کن
        contact_data = ContactMessageSerializer(contacts, many=True).data
        # فرض بر این است که ticketها هم همین مدل هستند
        return Response({'contacts': contact_data, 'tickets': contact_data})

class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        # اگر شرکت دارد، اطلاعات شرکت را هم بگیر
        company = getattr(user, 'company_profile', None)
        
        # Debug logging
        print(f"ProfileAPIView - User: {user.username}")
        print(f"ProfileAPIView - Company: {company}")
        if company:
            print(f"ProfileAPIView - Company profile_photo: {company.profile_photo}")
            print(f"ProfileAPIView - Company profile_photo.url: {company.profile_photo.url if company.profile_photo else 'None'}")
        
        profile_photo = None
        if company and company.profile_photo:
            profile_photo = company.profile_photo.url
            print(f"ProfileAPIView - Final profile_photo URL: {profile_photo}")
        
        response_data = {
            'full_name': getattr(company, 'manager_full_name', None) or user.get_full_name() or user.username,
            'email': user.email,
            'phone': getattr(company, 'phone', None) or getattr(user, 'phone', None) or getattr(user, 'mobile', None) or '',
            'date_joined': getattr(company, 'date_joined', None) or user.date_joined,
            'role': 'Manager' if user.is_staff or user.is_superuser else 'User',
            'profile_photo': profile_photo,
        }
        
        print(f"ProfileAPIView - Response data: {response_data}")
        return Response(response_data)

class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        print(f"UserCreateView - Request from user: {user.username}")
        print(f"UserCreateView - Request data: {request.data}")
        
        # فقط ادمین یا مدیر می‌تواند کاربر جدید ایجاد کند
        if not (user.is_staff or hasattr(user, 'company_profile')):
            print(f"UserCreateView - Permission denied for user: {user.username}")
            return Response({'detail': 'Permission denied.'}, status=403)
        
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            full_name = request.data.get('full_name', '')
            phone = request.data.get('phone', '')
            company_name = request.data.get('company_name', '')
            
            print(f"UserCreateView - Extracted data: username={username}, email={email}, password={'***' if password else 'None'}, full_name={full_name}, phone={phone}, company_name={company_name}")
            
            # بررسی وجود فیلدهای اجباری
            if not username or not email or not password:
                print(f"UserCreateView - Missing required fields: username={bool(username)}, email={bool(email)}, password={bool(password)}")
                return Response({
                    'detail': 'Username, email and password are required.'
                }, status=400)
            
            # بررسی تکراری نبودن username و email
            if User.objects.filter(username=username).exists():
                print(f"UserCreateView - Username already exists: {username}")
                return Response({
                    'detail': 'Username already exists.'
                }, status=400)
            
            if User.objects.filter(email=email).exists():
                print(f"UserCreateView - Email already exists: {email}")
                return Response({
                    'detail': 'Email already exists.'
                }, status=400)
            
            print(f"UserCreateView - Creating new user: {username}")
            
            # ایجاد کاربر جدید
            new_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=full_name.split()[0] if full_name else '',
                last_name=' '.join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else ''
            )
            
            print(f"UserCreateView - User created successfully: {new_user.id}")
            
            # Verify user was actually saved
            try:
                saved_user = User.objects.get(id=new_user.id)
                print(f"UserCreateView - User verification: ID={saved_user.id}, Username={saved_user.username}, Email={saved_user.email}, Active={saved_user.is_active}")
                
                # Test authentication
                test_auth = authenticate(username=saved_user.username, password=password)
                print(f"UserCreateView - Authentication test: {test_auth is not None}")
                if test_auth:
                    print(f"UserCreateView - Test auth successful for: {test_auth.username}")
                else:
                    print(f"UserCreateView - Test auth failed for: {saved_user.username}")
                    
            except User.DoesNotExist:
                print(f"UserCreateView - ERROR: User {new_user.id} was not found in database after creation!")
            except Exception as e:
                print(f"UserCreateView - Error during verification: {e}")
            
            # اگر company_name داده شده، Company Profile ایجاد کن
            company = None
            if company_name and company_name.strip():
                print(f"UserCreateView - Creating company profile: {company_name}")
                company = Company.objects.create(
                    user=new_user,
                    company_name=company_name,
                    manager_full_name=full_name,
                    phone=phone
                )
                print(f"UserCreateView - Company profile created: {company.id}")
            
            # لاگ فعالیت
            log_activity(request, 'user_created', {
                'created_user_id': new_user.id,
                'created_user_username': new_user.username
            })
            
            response_data = {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'full_name': full_name,
                'phone': phone,
                'company_name': company_name,
                'is_staff': new_user.is_staff,
                'is_superuser': new_user.is_superuser,
                'is_manager': company is not None,
                'date_joined': new_user.date_joined,
                'profile_photo': getattr(company, 'profile_photo.url', None) if company else None,
            }
            
            print(f"UserCreateView - Returning response: {response_data}")
            return Response(response_data, status=201)
            
        except Exception as e:
            print(f"UserCreateView - Error creating user: {e}")
            logger.error(f"Error creating user: {e}")
            return Response({
                'detail': 'Failed to create user. Please try again.'
            }, status=500)

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, user_id):
        user = request.user
        # فقط ادمین یا مدیر می‌تواند کاربران را ویرایش کند
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)
        
        try:
            target_user = User.objects.get(id=user_id)
            
            # بروزرسانی فیلدهای کاربر
            if 'username' in request.data:
                new_username = request.data['username']
                if User.objects.filter(username=new_username).exclude(id=user_id).exists():
                    return Response({
                        'detail': 'Username already exists.'
                    }, status=400)
                target_user.username = new_username
            
            if 'email' in request.data:
                new_email = request.data['email']
                if User.objects.filter(email=new_email).exclude(id=user_id).exists():
                    return Response({
                        'detail': 'Email already exists.'
                    }, status=400)
                target_user.email = new_email
            
            if 'full_name' in request.data:
                full_name = request.data['full_name']
                target_user.first_name = full_name.split()[0] if full_name else ''
                target_user.last_name = ' '.join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else ''
            
            target_user.save()
            
            # بروزرسانی Company Profile اگر وجود دارد
            company = getattr(target_user, 'company_profile', None)
            if company:
                if 'phone' in request.data:
                    company.phone = request.data['phone']
                if 'company_name' in request.data:
                    company.company_name = request.data['company_name']
                if 'full_name' in request.data:
                    company.manager_full_name = request.data['full_name']
                company.save()
            elif 'company_name' in request.data and request.data['company_name'].strip():
                # ایجاد Company Profile جدید
                company = Company.objects.create(
                    user=target_user,
                    company_name=request.data['company_name'],
                    manager_full_name=request.data.get('full_name', ''),
                    phone=request.data.get('phone', '')
                )
            
            # تغییر پسورد اگر داده شده
            if 'password' in request.data and request.data['password']:
                target_user.set_password(request.data['password'])
                target_user.save()
            
            # لاگ فعالیت
            log_activity(request, 'user_updated', {
                'updated_user_id': target_user.id,
                'updated_user_username': target_user.username
            })
            
            # بروزرسانی company reference بعد از تغییرات
            company = getattr(target_user, 'company_profile', None)
            
            return Response({
                'id': target_user.id,
                'username': target_user.username,
                'email': target_user.email,
                'full_name': f"{target_user.first_name} {target_user.last_name}".strip(),
                'phone': getattr(company, 'phone', '') if company else '',
                'company_name': getattr(company, 'company_name', '') if company else '',
                'is_staff': target_user.is_staff,
                'is_superuser': target_user.is_superuser,
                'is_manager': company is not None,
                'date_joined': target_user.date_joined,
                'profile_photo': getattr(company, 'profile_photo.url', None) if company else None,
            })
            
        except User.DoesNotExist:
            return Response({
                'detail': 'User not found.'
            }, status=404)
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return Response({
                'detail': 'Failed to update user. Please try again.'
            }, status=500)

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, user_id):
        user = request.user
        # فقط ادمین یا مدیر می‌تواند کاربران را حذف کند
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)
        
        try:
            target_user = User.objects.get(id=user_id)
            
            # جلوگیری از حذف خود کاربر
            if target_user.id == user.id:
                return Response({
                    'detail': 'You cannot delete your own account.'
                }, status=400)
            
            # لاگ فعالیت قبل از حذف
            log_activity(request, 'user_deleted', {
                'deleted_user_id': target_user.id,
                'deleted_user_username': target_user.username
            })
            
            target_user.delete()
            
            return Response({
                'detail': 'User deleted successfully.'
            })
            
        except User.DoesNotExist:
            return Response({
                'detail': 'User not found.'
            }, status=404)
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return Response({
                'detail': 'Failed to delete user. Please try again.'
            }, status=500)
