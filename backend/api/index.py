import os
from django.core.wsgi import get_wsgi_application

# Ensure settings module is set for Vercel
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = get_wsgi_application()


