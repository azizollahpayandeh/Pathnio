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
