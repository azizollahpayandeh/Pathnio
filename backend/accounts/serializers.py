from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Company, Driver, ContactMessage, SiteSettings, Profile, Alert, Vehicle, Trip, Expense, LocationPing, DriverInvitation
from djoser.serializers import UserSerializer as DjoserUserSerializer, UserCreateSerializer as DjoserUserCreateSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': True},
            'email': {'required': True}
        }

# سریالایزر کاستوم برای Djoser
class CustomDjoserUserSerializer(DjoserUserSerializer):
    manager_full_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    is_company = serializers.SerializerMethodField()
    is_driver = serializers.SerializerMethodField()

    class Meta(DjoserUserSerializer.Meta):
        fields = DjoserUserSerializer.Meta.fields + ('manager_full_name', 'full_name', 'company_name', 'is_company', 'is_driver')

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

# Custom User Create Serializer
class CustomUserCreateSerializer(DjoserUserCreateSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_retype = serializers.CharField(write_only=True)
    
    class Meta(DjoserUserCreateSerializer.Meta):
        fields = ('id', 'username', 'email', 'password', 'password_retype')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_retype']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_retype')
        user = User.objects.create_user(**validated_data)
        return user

class CompanyUserSerializer(serializers.ModelSerializer):
    is_manager = serializers.SerializerMethodField()
    is_staff = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z")
    phone = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_manager', 'is_staff', 'date_joined', 'phone', 'profile_photo')

    def get_is_manager(self, obj):
        return obj.is_staff or obj.is_superuser

    def get_is_staff(self, obj):
        return obj.is_staff

    def get_phone(self, obj):
        try:
            return obj.company_profile.phone
        except Exception:
            return None

    def get_profile_photo(self, obj):
        try:
            return obj.company_profile.profile_photo.url if obj.company_profile.profile_photo else None
        except Exception:
            return None

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer(write_only=True)  # Changed to write_only for creation
    phone = serializers.CharField(source='user.company_profile.phone', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    class Meta:
        model = Company
        fields = ('id', 'user', 'company_name', 'manager_full_name', 'phone', 'address', 'profile_photo', 'date_joined')

    def validate(self, attrs):
        # Validate user data
        user_data = attrs.get('user', {})
        
        # Check required fields
        if not user_data.get('username'):
            raise serializers.ValidationError({'user': {'username': 'Username is required.'}})
        
        if not user_data.get('email'):
            raise serializers.ValidationError({'user': {'email': 'Email is required.'}})
        
        if not user_data.get('password'):
            raise serializers.ValidationError({'user': {'password': 'Password is required.'}})
        
        # Check if username already exists
        if User.objects.filter(username=user_data['username']).exists():
            raise serializers.ValidationError({'user': {'username': 'A user with this username already exists.'}})
        
        # Check if email already exists
        if User.objects.filter(email=user_data['email']).exists():
            raise serializers.ValidationError({'user': {'email': 'A user with this email already exists.'}})
        
        return attrs

    def create(self, validated_data):
        # Extract user data
        user_data = validated_data.pop('user')
        
        # Remove password_retype if present
        user_data.pop('password_retype', None)
        
        try:
            # Create the user first
            user = User.objects.create_user(**user_data)
            
            # Create the company profile
            company = Company.objects.create(user=user, **validated_data)
            
            return company
        except Exception as e:
            # If user was created but company creation failed, delete the user
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(f'Failed to create company: {str(e)}')

    def to_representation(self, instance):
        """Custom representation for the response"""
        representation = super().to_representation(instance)
        # Add user information to the response
        representation['user'] = {
            'id': instance.user.id,
            'username': instance.user.username,
            'email': instance.user.email,
        }
        return representation

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('profile_photo',)
class CompanyUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing company profiles"""
    
    # Add language field for frontend compatibility
    language = serializers.CharField(required=False, write_only=True)
    profile_photo = serializers.ImageField(required=False)
    
    class Meta:
        model = Company
        fields = ('company_name', 'manager_full_name', 'phone', 'address', 'profile_photo', 'language')
        # Remove profile_photo from read_only_fields to allow updates

    def validate_phone(self, value):
        """Validate phone number format"""
        if value and len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits.")
        return value

    def validate_company_name(self, value):
        """Validate company name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long.")
        return value.strip()

    def validate_manager_full_name(self, value):
        """Validate manager full name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Manager full name must be at least 2 characters long.")
        return value.strip()

    def update(self, instance, validated_data):
        """Custom update method to handle language field"""
        # Remove language from validated_data as it's not a model field
        validated_data.pop('language', None)
        
        # Update the instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        """Custom representation for the response"""
        representation = super().to_representation(instance)
        # Add profile_photo URL if it exists
        if instance.profile_photo:
            representation['profile_photo'] = instance.profile_photo.url
        return representation

class DriverSerializer(serializers.ModelSerializer):
    # user is display-only (may be null for a profile-only driver). The login
    # account is linked at activation (Phase 3), never chosen by the client.
    user = UserSerializer(read_only=True)
    class Meta:
        model = Driver
        fields = ('id', 'user', 'full_name', 'mobile', 'email', 'plate_number', 'vehicle_type', 'profile_photo', 'company')
        # company is assigned server-side from the authenticated owner — a
        # driver/client must never be able to pick which company they join.
        read_only_fields = ('id', 'company', 'user')

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
    username = serializers.CharField(help_text="Enter your username or email address")
    password = serializers.CharField(write_only=True)

# Password Change Serializer
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

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

# Alert Serializer
class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ('id', 'alert_type', 'title', 'message', 'priority', 'read', 'ip_address', 'user_agent', 'timestamp')
        read_only_fields = ('id', 'timestamp')


# Fleet resource serializers
class VehicleSerializer(serializers.ModelSerializer):
    # Real driver relationship, derived from the active assignment (source of
    # truth). The legacy `driver` string stays for display but is kept in sync.
    assigned_driver = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ('id', 'company', 'created_at')

    def get_assigned_driver(self, obj):
        a = obj.assignments.filter(is_active=True).select_related('driver').first()
        return {'id': a.driver_id, 'full_name': a.driver.full_name} if a else None


class TripSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ('id', 'company', 'created_by', 'created_at', 'updated_at',
                            'driver', 'plate_number')

    def get_driver_name(self, obj):
        return obj.driver_ref.full_name if obj.driver_ref_id else (obj.driver or None)

    def get_vehicle_plate(self, obj):
        return obj.vehicle_ref.plate_number if obj.vehicle_ref_id else (obj.plate_number or None)


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('id', 'company', 'created_at')


class DriverInvitationSerializer(serializers.ModelSerializer):
    """Read-only invitation status for the owner dashboard. Never exposes the
    raw token (only the SHA-256 hash is stored, and even that is not returned)."""
    is_active = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = DriverInvitation
        fields = ('id', 'driver', 'company', 'status', 'created_at', 'expires_at',
                  'used_at', 'revoked_at', 'is_active', 'is_expired')
        read_only_fields = fields


class LocationPingSerializer(serializers.ModelSerializer):
    """Read/write serializer for a single GPS fix from the mobile app.

    The client only supplies the raw fix fields; company/driver/vehicle are
    resolved server-side from the authenticated user, so they are read-only.
    """
    class Meta:
        model = LocationPing
        fields = (
            'id', 'lat', 'lng', 'speed', 'heading', 'accuracy', 'altitude',
            'battery', 'is_moving', 'recorded_at', 'created_at',
            'company', 'driver', 'vehicle',
        )
        read_only_fields = ('id', 'created_at', 'company', 'driver', 'vehicle')
