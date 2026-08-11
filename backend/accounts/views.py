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
    ActivityLog, UserSession, SecuritySettings, LoginAttempt, Profile, Alert,
    Vehicle, Trip, Expense, LocationPing, Membership, DriverInvitation,
    DriverVehicleAssignment,
)
from .serializers import (
    CompanySerializer, CompanyUpdateSerializer, CompanyUserSerializer, DriverSerializer, ContactMessageSerializer,
    SiteSettingsSerializer, LoginSerializer, PasswordChangeSerializer,
    UserProfileUpdateSerializer, ActivityLogSerializer, AlertSerializer,
    VehicleSerializer, TripSerializer, ExpenseSerializer, LocationPingSerializer,
    DriverInvitationSerializer,
)
from .invitations import issue_invitation, hash_token
from .assignments import assign as assign_driver_vehicle, unassign as unassign_vehicle, AssignmentError
from .tenancy import (
    company_for, role_for, is_owner,
    CompanyScopedQuerysetMixin, IsCompanyMember, IsCompanyOwner,
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

def create_alert(user, alert_type, title, message, priority='medium', request=None):
    """Create a new alert for the user"""
    try:
        Alert.objects.create(
            user=user,
            alert_type=alert_type,
            title=title,
            message=message,
            priority=priority,
            ip_address=get_client_ip(request) if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT', '') if request else None
        )
        logger.info(f"Alert created for user {user.username}: {title}")
    except Exception as e:
        logger.error(f"Failed to create alert: {e}")
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
        
        # Try to get user object — accept an email in the username field too,
        # since owners register/sign in with their email.
        user_obj = User.objects.filter(username=username).first()
        if user_obj is None and '@' in (username or ''):
            user_obj = User.objects.filter(email__iexact=username).first()
            if user_obj is not None:
                username = user_obj.username
        user = authenticate(username=username, password=password)
        
        if user is not None:
            # Record successful login
            record_login_attempt(username, ip_address, user_agent, True, user)
            
            # Log activity
            log_activity(request, 'login', {
                'username': username,
                'method': 'jwt'
            }, user)
            
            # Create login alert
            create_alert(
                user=user,
                alert_type='login',
                title='Successful Login',
                message=f'You logged in successfully from IP: {get_client_ip(request)}',
                priority='low',
                request=request
            )
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
            
            # Create failed login alert for existing users
            if user_obj:
                create_alert(
                    user=user_obj,
                    alert_type='failed_login',
                    title='Failed Login Attempt',
                    message=f'Failed login attempt from IP: {ip_address}',
                    priority='high',
                    request=request
                )
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

# Authentication Views
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            
            # Check if user is locked out
            if check_login_attempts(username, ip_address):
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
                    username = user_obj.username  # Use the actual username for authentication
            
            if user_obj:
                pass
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                # Record successful login
                record_login_attempt(username, ip_address, user_agent, True, user)
                
                # Log activity
                log_activity(request, 'login', {
                    'username': username,
                    'method': 'password'
                }, user)
                
                # Create login alert
                create_alert(
                    user=user,
                    alert_type='login',
                    title='Successful Login',
                    message=f'You logged in successfully from IP: {ip_address}',
                    priority='low',
                    request=request
                )
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
                # Record failed login attempt (even if user does not exist)
                record_login_attempt(username, ip_address, user_agent, False, user_obj)
                
                # Improved error message
                if not user_obj:
                    return Response({
                        'detail': 'The entered username does not exist.',
                        'code': 'user_not_found',
                    }, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({
                        'detail': 'The password is incorrect. Please try again.',
                        'code': 'invalid_password',
                    }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Log activity
            log_activity(request, 'logout', {
                'session_id': request.session.session_key
            })
            
            # Create logout alert
            create_alert(
                user=request.user,
                alert_type='logout',
                title='Logout',
                message=f'You logged out from IP: {get_client_ip(request)}',
                priority='low',
                request=request
            )
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
        
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            
            # Check old password
            if not user.check_password(old_password):
                return Response({
                    'detail': 'Current password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            
            # Change password
            user.set_password(new_password)
            user.save()
            
            
            # Update security settings
            security_settings, created = SecuritySettings.objects.get_or_create(user=user)
            security_settings.last_password_change = timezone.now()
            security_settings.save()
            
            # Log activity
            log_activity(request, 'password_change', {
                'password_changed_at': timezone.now().isoformat()
            })
            
            # Create password change alert
            create_alert(
                user=user,
                alert_type='password_change',
                title='Password Changed',
                message=f'Your password was changed successfully from IP: {get_client_ip(request)}',
                priority='medium',
                request=request
            )
            return Response({'detail': 'Password changed successfully.'})
        else:
            pass
        
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
            
            # Create profile update alert
            create_alert(
                user=request.user,
                alert_type='profile_update',
                title='Profile Updated',
                message=f'Your profile was updated from IP: {get_client_ip(request)}',
                priority='low',
                request=request
            )
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

                # Authoritative role/tenant record for the new owner.
                Membership.objects.update_or_create(
                    user=company.user,
                    defaults={'company': company,
                              'role': Membership.Role.COMPANY_OWNER},
                )

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
    """Owner-only driver creation. company is FORCED to the authenticated
    owner's company — the client can never choose it (this closes the
    'driver joins any company' hole). Phase 3 will add one-time invitation
    tokens for the mobile activation half of the flow.
    """
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsCompanyOwner]

    def perform_create(self, serializer):
        company = company_for(self.request.user)
        with transaction.atomic():
            driver = serializer.save(company=company)
            # Only profile-with-account drivers get a Membership now; a
            # profile-only driver (user is None) gets one at activation.
            if driver.user_id:
                Membership.objects.update_or_create(
                    user=driver.user,
                    defaults={'company': company, 'role': Membership.Role.DRIVER},
                )
            log_activity(self.request, 'register', {
                'user_type': 'driver',
                'driver_name': driver.full_name
            }, getattr(driver, 'user', None))

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

class DriverListView(CompanyScopedQuerysetMixin, generics.ListAPIView):
    # Scoped to the caller's company by the mixin — an owner sees ONLY their
    # own drivers, never another company's. Ordered for stable pagination.
    queryset = Driver.objects.all().order_by('id')
    serializer_class = DriverSerializer
    permission_classes = [IsCompanyMember]

    def get(self, request, *args, **kwargs):
        log_activity(request, 'dashboard_access', {
            'section': 'driver_list'
        })
        return super().get(request, *args, **kwargs)

class DriverDetailView(CompanyScopedQuerysetMixin, generics.RetrieveAPIView):
    # get_queryset() scoping also closes object-level (IDOR) access: a driver
    # from another company simply isn't in the queryset -> 404.
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsCompanyMember]

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

    def get_profile_photo_url(self, user, company):
        """Safely get profile photo URL for a user"""
        try:
            # Try to get profile photo from user's profile first
            if hasattr(user, 'profile') and user.profile and user.profile.profile_photo:
                return user.profile.profile_photo.url
        except:
            pass
        
        try:
            # Fall back to company profile photo
            if company and hasattr(company, 'profile_photo') and company.profile_photo:
                return company.profile_photo.url
        except:
            pass
        
        # Return None if no photo found
        return None

    def get(self, request):
        user = request.user
        
        # فقط ادمین یا مدیر (کسی که company_profile دارد)
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)
        
        users = User.objects.all().order_by('-date_joined')
        
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
                'profile_photo': self.get_profile_photo_url(u, company),
            }
            data.append(user_data)
        
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
        if company:
            pass
        
        profile_photo = None
        if company and company.profile_photo:
            profile_photo = company.profile_photo.url
        
        response_data = {
            'full_name': getattr(company, 'manager_full_name', None) or user.get_full_name() or user.username,
            'email': user.email,
            'phone': getattr(company, 'phone', None) or getattr(user, 'phone', None) or getattr(user, 'mobile', None) or '',
            'date_joined': getattr(company, 'date_joined', None) or user.date_joined,
            'role': 'Manager' if user.is_staff or user.is_superuser else 'User',
            'profile_photo': profile_photo,
        }
        
        return Response(response_data)

class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # فقط ادمین یا مدیر می‌تواند کاربر جدید ایجاد کند
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)
        
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            full_name = request.data.get('full_name', '')
            phone = request.data.get('phone', '')
            company_name = request.data.get('company_name', '')
            role = request.data.get('role', 'user')  # 'user', 'manager', 'admin', 'superadmin'
            
            
            # بررسی وجود فیلدهای اجباری
            if not username or not email or not password:
                return Response({
                    'detail': 'Username, email and password are required.'
                }, status=400)
            
            # بررسی تکراری نبودن username و email
            if User.objects.filter(username=username).exists():
                return Response({
                    'detail': 'Username already exists.'
                }, status=400)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'detail': 'Email already exists.'
                }, status=400)
            
            
            # ایجاد کاربر جدید
            new_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=full_name.split()[0] if full_name else '',
                last_name=' '.join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else ''
            )
            
            # تنظیم نقش کاربر
            if role == 'admin':
                new_user.is_staff = True
            elif role == 'superadmin':
                new_user.is_staff = True
                new_user.is_superuser = True
            
            new_user.save()
            
            
            # Verify user was actually saved
            try:
                saved_user = User.objects.get(id=new_user.id)
                
                # Test authentication
                test_auth = authenticate(username=saved_user.username, password=password)
                if test_auth:
                    pass
                else:
                    pass
                    
            except User.DoesNotExist:
                pass
            except Exception as e:
                pass
            
            # اگر company_name داده شده، Company Profile ایجاد کن
            company = None
            if (company_name and company_name.strip()) or role == 'manager':
                company = Company.objects.create(
                    user=new_user,
                    company_name=company_name,
                    manager_full_name=full_name,
                    phone=phone
                )

            # Profile photo
            profile_photo = request.FILES.get('profile_photo')
            if profile_photo:
                profile, created = Profile.objects.get_or_create(user=new_user)
                profile.profile_photo = profile_photo
                profile.save()
            
            # لاگ فعالیت
            log_activity(request, 'user_created', {
                'created_user_id': new_user.id,
                'created_user_username': new_user.username
            })
            
            # Create alert for new user
            create_alert(
                user=new_user,
                alert_type='user_created',
                title='Account Created',
                message=f'Your account was created successfully by {user.username}',
                priority='medium',
                request=request
            )
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
                'profile_photo': new_user.profile.profile_photo.url if hasattr(new_user, 'profile') and new_user.profile.profile_photo else (company.profile_photo.url if company and company.profile_photo else None),
            }
            
            return Response(response_data, status=201)
            
        except Exception as e:
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
            
            # بروزرسانی نقش کاربر
            if 'role' in request.data:
                role = request.data['role']
                if role == 'user':
                    target_user.is_staff = False
                    target_user.is_superuser = False
                elif role == 'manager':
                    target_user.is_staff = False
                    target_user.is_superuser = False
                elif role == 'admin':
                    target_user.is_staff = True
                    target_user.is_superuser = False
                elif role == 'superadmin':
                    target_user.is_staff = True
                    target_user.is_superuser = True
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
            
            # Profile photo
            if 'profile_photo' in request.FILES:
                profile, created = Profile.objects.get_or_create(user=target_user)
                profile.profile_photo = request.FILES['profile_photo']
                profile.save()
            # لاگ فعالیت
            log_activity(request, 'user_updated', {
                'updated_user_id': target_user.id,
                'updated_user_username': target_user.username
            })
            
            # Create alert for updated user
            create_alert(
                user=target_user,
                alert_type='user_updated',
                title='Account Updated',
                message=f'Your account was updated by {user.username}',
                priority='medium',
                request=request
            )
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
                'profile_photo': target_user.profile.profile_photo.url if hasattr(target_user, 'profile') and target_user.profile.profile_photo else (company.profile_photo.url if company and company.profile_photo else None),
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
            
            # Create alert for deleted user (before deletion)
            create_alert(
                user=target_user,
                alert_type='user_deleted',
                title='Account Deleted',
                message=f'Your account was deleted by {user.username}',
                priority='critical',
                request=request
            )
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

class UserAlertsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's alerts"""
        alerts = Alert.objects.filter(user=request.user).order_by('-timestamp')[:50]
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    def patch(self, request, alert_id):
        """Mark alert as read"""
        try:
            alert = Alert.objects.get(id=alert_id, user=request.user)
            alert.read = True
            alert.save()
            return Response({'detail': 'Alert marked as read.'})
        except Alert.DoesNotExist:
            return Response({'detail': 'Alert not found.'}, status=404)

class AdminAlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all alerts for admin"""
        user = request.user
        if not (user.is_staff or hasattr(user, 'company_profile')):
            return Response({'detail': 'Permission denied.'}, status=403)

        alerts = Alert.objects.all().order_by('-timestamp')[:100]
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)


class CompanyScopedViewSet(CompanyScopedQuerysetMixin, viewsets.ModelViewSet):
    """Base viewset that scopes fleet resources to the requesting user's company.

    Tenant isolation (incl. object-level / IDOR protection) is enforced by
    CompanyScopedQuerysetMixin.get_queryset(). company is always set
    server-side on create — never taken from the request body.
    """
    permission_classes = [IsCompanyMember]

    def perform_create(self, serializer):
        serializer.save(company=company_for(self.request.user))


class VehicleViewSet(CompanyScopedViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class TripViewSet(CompanyScopedViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


class ExpenseViewSet(CompanyScopedViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


class DriverViewSet(CompanyScopedViewSet):
    """Company-scoped driver CRUD for the owner dashboard.

    Reads: any company member. Create/update/delete: owner only.
    Drivers are created profile-only (no login account) — Phase 3's invitation
    flow links a real user at activation.
    """
    queryset = Driver.objects.all().order_by('id')
    serializer_class = DriverSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsCompanyMember()]
        return [IsCompanyOwner()]


class LocationIngestView(APIView):
    """Receive GPS fixes from the Pathnio driver app.

    Accepts either a single fix or a batch:

        POST /api/accounts/locations/
        { "locations": [ {lat, lng, speed, heading, accuracy,
                          altitude, battery, is_moving, recorded_at}, ... ] }

    The authenticated user resolves to a Driver (via driver_profile) and,
    where possible, a Vehicle (matched on plate_number within the driver's
    company). Every fix is stored as history; the most recent fix is mirrored
    onto the Vehicle so the live map updates. A company manager / staff user
    may also post on behalf of a vehicle by passing "plate_number".
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # --- Resolve who / what this batch belongs to -----------------
        driver = getattr(user, 'driver_profile', None)
        company = getattr(driver, 'company', None) or getattr(user, 'company_profile', None)

        # Vehicle is derived SERVER-SIDE from the driver's active assignment —
        # the client's vehicle_id is never trusted. Plate is only a fallback for
        # legacy/unassigned drivers and manager/staff overrides.
        vehicle = None
        if driver is not None:
            active = (DriverVehicleAssignment.objects
                      .filter(driver=driver, is_active=True)
                      .select_related('vehicle').first())
            if active:
                vehicle = active.vehicle
                if company is None:
                    company = vehicle.company
        if vehicle is None:
            plate = (request.data.get('plate_number')
                     or getattr(driver, 'plate_number', None))
            if plate:
                vq = Vehicle.objects.filter(plate_number=plate)
                if company is not None:
                    vq = vq.filter(company=company)
                vehicle = vq.first()
                if vehicle and company is None:
                    company = vehicle.company

        # --- Normalise payload to a list ------------------------------
        raw = request.data.get('locations')
        if raw is None:
            raw = [request.data]  # single-fix convenience form
        if not isinstance(raw, list):
            return Response({'detail': '"locations" must be a list.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not raw:
            return Response({'saved': 0, 'detail': 'No locations supplied.'},
                            status=status.HTTP_200_OK)

        # --- Persist each fix -----------------------------------------
        saved = []
        errors = []
        for i, item in enumerate(raw):
            ser = LocationPingSerializer(data=item)
            if not ser.is_valid():
                errors.append({'index': i, 'errors': ser.errors})
                continue
            ping = ser.save(company=company, driver=driver, vehicle=vehicle)
            saved.append(ping)

        if not saved:
            return Response(
                {'saved': 0, 'errors': errors, 'detail': 'No valid fixes.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- Mirror the newest fix onto the Vehicle -------------------
        if vehicle is not None:
            latest = max(saved, key=lambda p: p.recorded_at)
            vehicle.lat = latest.lat
            vehicle.lng = latest.lng
            # Vehicle.speed is a whole-number field the UI reads as km/h;
            # GPS speed is m/s, so convert.
            vehicle.speed = max(0, round((latest.speed or 0) * 3.6))
            vehicle.save(update_fields=['lat', 'lng', 'speed'])

        return Response(
            {
                'saved': len(saved),
                'errors': errors,
                'vehicle': vehicle.plate_number if vehicle else None,
            },
            status=status.HTTP_201_CREATED,
        )


# ===========================================================================
# Phase 3 — Secure driver invitation + mobile activation
# ===========================================================================

def _driver_context(user):
    """Authenticated driver context — the single source of truth the mobile app
    reads to decide login vs. activation vs. tracking. Never trusts local data.
    """
    driver = getattr(user, 'driver_profile', None)
    if not driver:
        return {'activated': False, 'driver': None, 'company': None, 'vehicle': None}
    active = (DriverVehicleAssignment.objects
              .filter(driver=driver, is_active=True)
              .select_related('vehicle').first())
    vehicle = None
    if active:
        v = active.vehicle
        vehicle = {'id': v.id, 'plate_number': v.plate_number,
                   'model': v.model, 'vehicle_type': v.vehicle_type}
    return {
        'activated': True,
        'driver': {
            'id': driver.id,
            'full_name': driver.full_name,
            'mobile': driver.mobile,
            'email': driver.email,
            'plate_number': driver.plate_number,
            'vehicle_type': driver.vehicle_type,
        },
        'company': (
            {'id': driver.company_id, 'name': getattr(driver.company, 'company_name', None)}
            if driver.company_id else None
        ),
        'vehicle': vehicle,
    }


def _owned_driver_or_response(request, driver_id):
    """Fetch a driver ONLY if it belongs to the authenticated owner's company.
    Returns (driver, None) or (None, 404 Response) — closes cross-tenant access.
    """
    company = company_for(request.user)
    driver = Driver.objects.filter(id=driver_id).select_related('company').first()
    if not driver or company is None or driver.company_id != company.id:
        return None, Response({'detail': 'Driver not found.'}, status=status.HTTP_404_NOT_FOUND)
    return driver, None


class DriverRegisterMobileView(APIView):
    """Public: a driver creates a bare login account from the mobile app.

    The account has NO company/driver/role until it is activated with a valid
    invitation token, so an unlinked account can access nothing.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        email = (request.data.get('email') or '').strip()
        password = request.data.get('password') or ''
        if not username or not password:
            return Response({'detail': 'Username and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response({'detail': 'Password must be at least 6 characters.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'A user with this username already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if email and User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'A user with this email already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
            **_driver_context(user),
        }, status=status.HTTP_201_CREATED)


class DriverMeView(APIView):
    """Authenticated driver context (activation status + driver/company)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_driver_context(request.user))


class DriverInvitationView(APIView):
    """Owner: GET current invitation status / POST issue a new one for a driver
    in the owner's own company. The raw token is returned only on POST, once.
    """
    permission_classes = [IsCompanyOwner]

    def get(self, request, driver_id):
        driver, err = _owned_driver_or_response(request, driver_id)
        if err:
            return err
        inv = driver.invitations.first()  # latest (model ordering = -created_at)
        return Response({
            'invitation': DriverInvitationSerializer(inv).data if inv else None,
        })

    def post(self, request, driver_id):
        driver, err = _owned_driver_or_response(request, driver_id)
        if err:
            return err
        if driver.user_id:
            return Response({'detail': 'Driver is already activated.'},
                            status=status.HTTP_409_CONFLICT)
        inv, raw = issue_invitation(driver, company_for(request.user), request.user)
        return Response({
            'invitation': DriverInvitationSerializer(inv).data,
            'token': raw,  # shown exactly once
        }, status=status.HTTP_201_CREATED)


class DriverInvitationRevokeView(APIView):
    permission_classes = [IsCompanyOwner]

    def post(self, request, driver_id):
        driver, err = _owned_driver_or_response(request, driver_id)
        if err:
            return err
        n = DriverInvitation.objects.filter(
            driver=driver, status=DriverInvitation.Status.PENDING
        ).update(status=DriverInvitation.Status.REVOKED, revoked_at=timezone.now())
        return Response({'revoked': n})


class DriverInvitationRegenerateView(APIView):
    permission_classes = [IsCompanyOwner]

    def post(self, request, driver_id):
        driver, err = _owned_driver_or_response(request, driver_id)
        if err:
            return err
        if driver.user_id:
            return Response({'detail': 'Driver is already activated.'},
                            status=status.HTTP_409_CONFLICT)
        inv, raw = issue_invitation(driver, company_for(request.user), request.user)
        return Response({
            'invitation': DriverInvitationSerializer(inv).data,
            'token': raw,
        }, status=status.HTTP_201_CREATED)


class DriverActivateView(APIView):
    """Mobile: bind the authenticated user -> Driver -> Company using a token.

    company_id / driver_id are NEVER accepted from the client — both are derived
    from the invitation. Runs atomically with a row lock so one token can never
    be consumed twice, even under concurrent requests.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = (request.data.get('token') or '').strip()
        if not token:
            return Response({'detail': 'Activation code is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        # A user already bound to a driver can't re-activate into another.
        if Driver.objects.filter(user=user).exists():
            return Response({'detail': 'This account is already linked to a driver.'},
                            status=status.HTTP_409_CONFLICT)

        token_h = hash_token(token)
        with transaction.atomic():
            inv = (DriverInvitation.objects
                   .select_for_update()
                   .select_related('driver', 'company')
                   .filter(token_hash=token_h)
                   .first())
            if inv is None:
                return Response({'detail': 'Invalid activation code.'},
                                status=status.HTTP_400_BAD_REQUEST)
            if inv.status == DriverInvitation.Status.USED or inv.used_at:
                return Response({'detail': 'This activation code has already been used.'},
                                status=status.HTTP_400_BAD_REQUEST)
            if inv.status == DriverInvitation.Status.REVOKED or inv.revoked_at:
                return Response({'detail': 'This activation code has been revoked.'},
                                status=status.HTTP_400_BAD_REQUEST)
            if inv.is_expired:
                return Response({'detail': 'This activation code has expired.'},
                                status=status.HTTP_400_BAD_REQUEST)

            driver = inv.driver
            if driver.user_id:
                return Response({'detail': 'This driver is already activated.'},
                                status=status.HTTP_409_CONFLICT)

            # Bind user -> driver -> company, and mark the token used.
            driver.user = user
            driver.save(update_fields=['user'])
            inv.status = DriverInvitation.Status.USED
            inv.used_at = timezone.now()
            inv.save(update_fields=['status', 'used_at'])
            Membership.objects.update_or_create(
                user=user,
                defaults={'company': inv.company, 'role': Membership.Role.DRIVER},
            )

        return Response(_driver_context(user), status=status.HTTP_200_OK)


# ===========================================================================
# Phase 4 — Driver <-> Vehicle assignment
# ===========================================================================

class VehicleAssignView(APIView):
    """Owner: assign a driver to a vehicle. Both must be in the owner's company;
    cross-company assignment is impossible."""
    permission_classes = [IsCompanyOwner]

    def post(self, request, vehicle_id):
        company = company_for(request.user)
        vehicle = Vehicle.objects.filter(id=vehicle_id, company=company).first()
        if not vehicle:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)
        driver = Driver.objects.filter(id=request.data.get('driver_id'), company=company).first()
        if not driver:
            return Response({'detail': 'Driver not found in your company.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            assign_driver_vehicle(vehicle, driver, request.user)
        except AssignmentError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        vehicle.refresh_from_db()
        return Response(VehicleSerializer(vehicle).data, status=status.HTTP_200_OK)


class VehicleUnassignView(APIView):
    """Owner: remove the vehicle's active driver assignment."""
    permission_classes = [IsCompanyOwner]

    def post(self, request, vehicle_id):
        company = company_for(request.user)
        vehicle = Vehicle.objects.filter(id=vehicle_id, company=company).first()
        if not vehicle:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)
        unassign_vehicle(vehicle)
        vehicle.refresh_from_db()
        return Response(VehicleSerializer(vehicle).data, status=status.HTTP_200_OK)
