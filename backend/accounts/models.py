from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=255)
    manager_full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=512, blank=True)

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
