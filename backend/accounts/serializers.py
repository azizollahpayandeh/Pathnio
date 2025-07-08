from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Company, Driver, ContactMessage
from djoser.serializers import UserSerializer as DjoserUserSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

# سریالایزر کاستوم برای Djoser
class CustomDjoserUserSerializer(DjoserUserSerializer):
    manager_full_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta(DjoserUserSerializer.Meta):
        fields = DjoserUserSerializer.Meta.fields + ('manager_full_name', 'full_name', 'company_name')

    def get_manager_full_name(self, obj):
        try:
            return obj.company_profile.manager_full_name
        except Exception:
            return None

    def get_full_name(self, obj):
        try:
            return obj.driver.full_name
        except Exception:
            return None

    def get_company_name(self, obj):
        try:
            return obj.company_profile.company_name
        except Exception:
            return None

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

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'message', 'created_at') 