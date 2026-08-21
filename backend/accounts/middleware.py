import logging
import sys
from django.utils import timezone
from django.http import JsonResponse
from django.core.cache import cache
from .models import UserSession, ActivityLog, LoginAttempt
from datetime import timedelta
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class SecurityMiddleware(MiddlewareMixin):
    # Security headers must be set on EVERY response, including the login
    # endpoints — there is nothing here that legitimately needs to be
    # skipped for them. Doing the header-setting in process_response (the
    # idiomatic MiddlewareMixin hook) instead of manually calling
    # self.get_response(request) from inside process_request means it always
    # runs, regardless of path, and there is no path-based "skip" left to
    # accidentally bypass it.
    def process_response(self, request, response):
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
        # The test client reuses one IP across the whole suite's requests,
        # which would false-trip this cache-backed counter (same rationale
        # as DEFAULT_THROTTLE_RATES being disabled under 'test' in settings.py).
        if 'test' in sys.argv:
            return None

        client_ip = self.get_client_ip(request)

        # Simple rate limiting: 100 requests per minute per IP. Must live in
        # the shared cache, not on `request` - a fresh HttpRequest is built
        # per request, so per-request state can never accumulate a count.
        cache_key = f'ratelimit:{client_ip}'
        count = cache.get(cache_key, 0)
        if count >= 100:
            return JsonResponse({'detail': 'Rate limit exceeded'}, status=429)
        cache.set(cache_key, count + 1, timeout=60)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 