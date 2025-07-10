from django.contrib import admin
from .models import Company, Driver, ContactMessage, SiteSettings

# Register your models here.
admin.site.register(Company)
admin.site.register(Driver)
admin.site.register(ContactMessage)
admin.site.register(SiteSettings)
