from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Company, Driver

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Company
        fields = ('id', 'user', 'company_name', 'manager_full_name', 'phone', 'address')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        company = Company.objects.create(user=user, **validated_data)
        return company

class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Driver
        fields = ('id', 'user', 'full_name', 'mobile', 'plate_number', 'vehicle_type', 'profile_photo', 'company')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        driver = Driver.objects.create(user=user, **validated_data)
        return driver 