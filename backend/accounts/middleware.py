import logging
from django.utils import timezone
from django.http import JsonResponse
from django.core.cache import cache
from .models import UserSession, ActivityLog, LoginAttempt
from datetime import timedelta
import time
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class SecurityMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip authentication for login endpoints
        if request.path in ['/api/auth/token/login/', '/api/test/login/']:
            return None
            
        # Add security headers
        response = self.get_response(request)
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        return response

class SessionTimeoutMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip for login endpoints
        if request.path in ['/api/auth/token/login/', '/api/test/login/']:
            return None
            
        if request.user.is_authenticated and request.session:
            last_activity = request.session.get('last_activity')
            if last_activity:
                last_activity = timezone.datetime.fromisoformat(last_activity)
                if timezone.now() - last_activity > timedelta(hours=5):
                    # Session expired
                    request.session.flush()
                    return JsonResponse({'detail': 'Session expired'}, status=401)
            
            request.session['last_activity'] = timezone.now().isoformat()

class RateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip for login endpoints
        if request.path in ['/api/auth/token/login/', '/api/test/login/']:
            return None
            
        client_ip = self.get_client_ip(request)
        current_time = time.time()
        
        # Simple rate limiting: 100 requests per minute per IP
        if not hasattr(request, 'rate_limit_data'):
            request.rate_limit_data = {}
        
        if client_ip not in request.rate_limit_data:
            request.rate_limit_data[client_ip] = {'count': 0, 'reset_time': current_time + 60}
        
        if current_time > request.rate_limit_data[client_ip]['reset_time']:
            request.rate_limit_data[client_ip] = {'count': 0, 'reset_time': current_time + 60}
        
        request.rate_limit_data[client_ip]['count'] += 1
        
        if request.rate_limit_data[client_ip]['count'] > 100:
            return JsonResponse({'detail': 'Rate limit exceeded'}, status=429)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 