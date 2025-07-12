from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=255)
    manager_full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=512, blank=True)
    profile_photo = models.ImageField(upload_to='company_profiles/', blank=True, null=True)
    date_joined = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.company_name

class Driver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    full_name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)
    plate_number = models.CharField(max_length=32)
    vehicle_type = models.CharField(max_length=64, blank=True)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='drivers')

    def __str__(self):
        return self.full_name

class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("answered", "Answered"),
        ("closed", "Closed"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tickets", null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, default="Support")
    message = models.TextField()
    reply = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} <{self.email}> - {self.subject}"

class SiteSettings(models.Model):
    THEME_CHOICES = [
        ("light", "Light"),
        ("dark", "Dark"),
    ]
    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("fa", "Farsi"),
    ]
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default="light")
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default="en")
    primary_color = models.CharField(max_length=16, default="#2563eb")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings ({self.language}, {self.theme})"

class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('register', 'Register'),
        ('password_change', 'Password Change'),
        ('profile_update', 'Profile Update'),
        ('dashboard_access', 'Dashboard Access'),
        ('api_call', 'API Call'),
        ('file_upload', 'File Upload'),
        ('data_export', 'Data Export'),
        ('admin_action', 'Admin Action'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'action', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.action} - {self.timestamp}"

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.username} - {self.session_key[:20]}..."

class SecuritySettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_settings')
    two_factor_enabled = models.BooleanField(default=False)
    login_notifications = models.BooleanField(default=True)
    session_timeout = models.IntegerField(default=432000)  # 5 days in seconds
    max_login_attempts = models.IntegerField(default=5)
    lockout_duration = models.IntegerField(default=900)  # 15 minutes in seconds
    last_password_change = models.DateTimeField(auto_now_add=True)
    password_expiry_days = models.IntegerField(default=90)
    
    def __str__(self):
        return f"Security Settings - {self.user.username}"

class LoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_attempts', null=True, blank=True)
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    user_agent = models.TextField()
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['username', 'ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"{self.username} - {status} - {self.timestamp}"
