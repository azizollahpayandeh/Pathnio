from django.shortcuts import render
from rest_framework import generics, permissions, status
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

from .models import (
    Company, Driver, ContactMessage, SiteSettings, 
    ActivityLog, UserSession, SecuritySettings, LoginAttempt
)
from .serializers import (
    CompanySerializer, DriverSerializer, ContactMessageSerializer, 
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
                'detail': 'نام کاربری و رمز عبور الزامی است.',
                'code': 'missing_credentials',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check if user is locked out
        if check_login_attempts(username, ip_address):
            return Response({
                'detail': 'اکانت شما به دلیل تلاش ناموفق زیاد، به مدت یک ساعت قفل شد. لطفاً بعداً دوباره تلاش کنید.',
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
                }
            })
        else:
            # Record failed login attempt (even if user does not exist)
            record_login_attempt(username, ip_address, user_agent, False, user_obj)
            
            # Improved error message
            if not user_obj:
                logger.warning(f"Login attempt with non-existent username: {username}")
                return Response({
                    'detail': 'نام کاربری وارد شده وجود ندارد.',
                    'code': 'user_not_found',
                }, status=status.HTTP_401_UNAUTHORIZED)
            else:
                logger.warning(f"Failed login attempt for user: {username}")
                return Response({
                    'detail': 'رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.',
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
            
            # Try to get user object
            user_obj = User.objects.filter(username=username).first()
            user = authenticate(username=username, password=password)
            
            if user is not None:
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
                    }
                })
            else:
                # Record failed login attempt (even if user does not exist)
                record_login_attempt(username, ip_address, user_agent, False, user_obj)
                
                # Improved error message
                if not user_obj:
                    return Response({
                        'detail': 'نام کاربری وارد شده وجود ندارد.',
                        'code': 'user_not_found',
                    }, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({
                        'detail': 'رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.',
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
            
            return Response({'detail': 'Password changed successfully.'})
        
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
    
    def perform_create(self, serializer):
        with transaction.atomic():
            company = serializer.save()
            log_activity(self.request, 'register', {
                'user_type': 'company',
                'company_name': company.company_name
            }, company.user)

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
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_activity(request, 'profile_update', {
                'section': 'company_profile',
                'updated_fields': list(request.data.keys())
            })
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DriverListView(generics.ListAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        log_activity(request, 'dashboard_access', {
            'section': 'driver_list'
        })
        return super().get(request, *args, **kwargs)

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
