from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Company, Driver, ContactMessage, SiteSettings
from djoser.serializers import UserSerializer as DjoserUserSerializer, UserCreateSerializer as DjoserUserCreateSerializer

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def get_role(self, obj):
        return getattr(obj.profile, 'role', 'user')

# سریالایزر کاستوم برای Djoser
class CustomDjoserUserSerializer(DjoserUserSerializer):
    manager_full_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    is_company = serializers.SerializerMethodField()
    is_driver = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta(DjoserUserSerializer.Meta):
        fields = DjoserUserSerializer.Meta.fields + ('manager_full_name', 'full_name', 'company_name', 'is_company', 'is_driver', 'role')

    def get_manager_full_name(self, obj):
        try:
            return obj.company_profile.manager_full_name
        except Exception:
            return None

    def get_full_name(self, obj):
        try:
            return obj.driver_profile.full_name
        except Exception:
            return None

    def get_company_name(self, obj):
        try:
            return obj.company_profile.company_name
        except Exception:
            return None

    def get_is_company(self, obj):
        try:
            return hasattr(obj, 'company_profile')
        except Exception:
            return False

    def get_is_driver(self, obj):
        try:
            return hasattr(obj, 'driver_profile')
        except Exception:
            return False

    def get_role(self, obj):
        return getattr(obj.profile, 'role', 'user')

# Custom User Create Serializer
class CustomUserCreateSerializer(DjoserUserCreateSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_retype = serializers.CharField(write_only=True)
    role = serializers.CharField(read_only=True)
    
    class Meta(DjoserUserCreateSerializer.Meta):
        fields = ('id', 'username', 'email', 'password', 'password_retype', 'role')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_retype']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_retype')
        user = User.objects.create_user(**validated_data)
        # Set role: only 'Azizollah' can be superadmin
        if user.username == 'Azizollah':
            user.profile.role = 'superadmin'
            user.profile.save()
        return user

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Company
        fields = ('id', 'user', 'company_name', 'manager_full_name', 'phone', 'address', 'profile_photo', 'date_joined')

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
    user = serializers.StringRelatedField(read_only=True)
    name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    class Meta:
        model = ContactMessage
        fields = ('id', 'user', 'name', 'email', 'subject', 'message', 'reply', 'status', 'created_at', 'answered_at')

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ("id", "theme", "language", "primary_color", "updated_at")

# Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

# Password Change Serializer
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_retype = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_retype']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

# User Profile Update Serializer
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')
        read_only_fields = ('username',)

# Activity Log Serializer
class ActivityLogSerializer(serializers.Serializer):
    action = serializers.CharField()
    timestamp = serializers.DateTimeField()
    ip_address = serializers.IPAddressField()
    user_agent = serializers.CharField()
    details = serializers.JSONField(required=False) 