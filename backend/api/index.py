import os

# Ensure settings are configured before Django is imported.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from django.core.wsgi import get_wsgi_application

# Expose under both names so Vercel's Django builder finds the WSGI callable
# regardless of which convention it looks for.
application = get_wsgi_application()
app = application
