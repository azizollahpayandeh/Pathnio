import logging

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Company, Driver, ContactMessage, SiteSettings, Profile, Alert, Vehicle, Trip, Expense, LocationPing, DriverInvitation, Cargo, FleetAlert, CompanySettings
from djoser.serializers import UserSerializer as DjoserUserSerializer, UserCreateSerializer as DjoserUserCreateSerializer

logger = logging.getLogger(__name__)

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

        # Create the user first
        user = User.objects.create_user(**user_data)

        try:
            # Company creation runs in its own savepoint (nested atomic). The
            # caller (CompanyRegisterView) already wraps this whole call in an
            # outer transaction.atomic(); without this nested block, a failure
            # here would mark that outer transaction "needs rollback", and the
            # user.delete() below would then raise TransactionManagementError
            # instead of cleaning up — turning a clean 400 into a 500.
            with transaction.atomic():
                company = Company.objects.create(user=user, **validated_data)
            return company
        except Exception as e:
            # If user was created but company creation failed, delete the
            # user. The nested atomic() above rolled back to its own
            # savepoint on failure, so the outer transaction is still healthy
            # and this delete can run cleanly.
            logger.error("Company creation failed after user %s was created: %s",
                        user.username, e)
            user.delete()
            raise serializers.ValidationError(
                'Failed to create company. Please try again.')

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
    # System-derived status — the client DISPLAYS it, never sets it. Computed
    # from activation + active trip + assigned-vehicle telemetry recency.
    status = serializers.SerializerMethodField()
    activated = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = ('id', 'user', 'full_name', 'mobile', 'email', 'plate_number', 'vehicle_type', 'profile_photo', 'company', 'status', 'activated', 'last_seen_at')
        # company is assigned server-side from the authenticated owner — a
        # driver/client must never be able to pick which company they join.
        # (status/activated are SerializerMethodFields — already read-only.)
        # last_seen_at is set by telemetry ingest only.
        read_only_fields = ('id', 'company', 'user', 'last_seen_at')

    def get_activated(self, obj) -> bool:
        return bool(obj.user_id)

    def get_status(self, obj) -> str:
        from .fleet_status import (
            driver_status, company_thresholds,
            AVAILABLE, ON_TRIP, DRIVER_OFFLINE, DRIVER_INACTIVE,
        )
        from .models import Trip, DriverVehicleAssignment
        # The driver list/viewset prefetch these onto the queryset (see
        # DriverListView / DriverViewSet) as '_prefetched_active_trips' /
        # '_prefetched_active_assignments' so this doesn't re-query per row
        # (N+1 on the driver list). Fall back to a direct query for any
        # caller that hands in a plain, unprefetched Driver instance.
        if hasattr(obj, '_prefetched_active_trips'):
            has_active_trip = bool(obj._prefetched_active_trips)
        else:
            has_active_trip = Trip.objects.filter(driver_ref=obj, status="ACTIVE").exists()
        if hasattr(obj, '_prefetched_active_assignments'):
            assignment = (obj._prefetched_active_assignments[0]
                          if obj._prefetched_active_assignments else None)
        else:
            assignment = (
                DriverVehicleAssignment.objects
                .filter(driver=obj, is_active=True)
                .select_related("vehicle").first()
            )
        vehicle = assignment.vehicle if assignment else None
        _, offline_timeout = company_thresholds(obj.company)
        raw = driver_status(obj, has_active_trip, vehicle, offline_timeout)
        # Map engine states -> stable UI labels (display only).
        return {
            AVAILABLE: "Active",
            ON_TRIP: "On Trip",
            DRIVER_OFFLINE: "Offline",
            DRIVER_INACTIVE: "Inactive",
        }.get(raw, "Inactive")

class ContactMessageSerializer(serializers.ModelSerializer):
    # For the AUTHENTICATED support-ticket flow: name/email are server-set from
    # the logged-in user, so they are read-only here (the client cannot spoof
    # another identity).
    user = serializers.StringRelatedField(read_only=True)
    name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    class Meta:
        model = ContactMessage
        fields = ('id', 'user', 'name', 'email', 'subject', 'message', 'reply', 'status', 'created_at', 'answered_at')


class PublicContactSerializer(serializers.ModelSerializer):
    """The PUBLIC contact form: an anonymous visitor supplies their own name
    and email, so those must be writable (and required) — unlike the
    authenticated ticket serializer, where the server fills them from the user.
    """
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'subject', 'message', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_subject(self, value):
        return value or "Contact Form Submission"

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
    # Write-only: assigning a driver while creating/editing a vehicle creates a
    # REAL DriverVehicleAssignment (the legacy `driver` name string alone never
    # counts as an assignment — that silently left drivers unassigned).
    driver_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Vehicle
        fields = '__all__'
        # lat/lng/speed/last_seen_at/fuel_level/odometer are server-owned
        # telemetry — set ONLY by LocationIngestView / driver_ops from real GPS
        # fixes and DVIR odometer readings. A company member must never be
        # able to fake a vehicle's position/speed/fuel via a normal PATCH —
        # that would defeat the whole "server owns telemetry" design
        # (docs/ARCHITECTURE.md §8).
        read_only_fields = ('id', 'company', 'created_at',
                            'lat', 'lng', 'speed', 'last_seen_at',
                            'fuel_level', 'fuel_reported_at', 'odometer')

    def get_assigned_driver(self, obj):
        # obj.assignments is prefetched by the viewset (prefetch_related
        # 'assignments__driver'); filtering in Python here (rather than
        # obj.assignments.filter(...)) reuses that cache instead of firing a
        # fresh query per vehicle on the list endpoint.
        a = next((a for a in obj.assignments.all() if a.is_active), None)
        return {'id': a.driver_id, 'full_name': a.driver.full_name} if a else None

    def validate_plate_number(self, value):
        """Plate numbers are unique WITHIN a company (different companies may
        legitimately reuse a plate). Gives the owner a clear, human error."""
        request = self.context.get('request')
        if not request:
            return value
        from .tenancy import company_for
        company = company_for(request.user)
        if company is None:
            return value
        qs = Vehicle.objects.filter(company=company, plate_number__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"A vehicle with plate {value} already exists in your fleet.")
        return value


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'
        read_only_fields = ('id', 'company', 'created_at')


class FleetAlertSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.SerializerMethodField()

    class Meta:
        model = FleetAlert
        fields = ('id', 'severity', 'alert_type', 'title', 'message', 'vehicle',
                  'vehicle_plate', 'driver', 'trip', 'created_at',
                  'acknowledged_at', 'resolved_at')
        read_only_fields = fields

    def get_vehicle_plate(self, obj):
        return obj.vehicle.plate_number if obj.vehicle_id else None


class TripSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.SerializerMethodField()
    cargos = CargoSerializer(many=True, read_only=True)

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
        # source/approval/submitted_by are decided by the server: a client must
        # never be able to mark its own submission approved.
        read_only_fields = ('id', 'company', 'created_at', 'source', 'approval',
                            'submitted_by')

    def to_internal_value(self, data):
        """Accept an ISO datetime for `date` and narrow it to a calendar date.

        The model field is a DateField, so a client sending
        "2026-08-12T00:00:00.000Z" was rejected outright ("Date has wrong
        format") and the expense silently failed to save. Normalising here
        makes the API forgiving without weakening validation.
        """
        raw = data.get('date') if hasattr(data, 'get') else None
        if isinstance(raw, str) and 'T' in raw:
            data = data.copy()
            data['date'] = raw.split('T', 1)[0]
        return super().to_internal_value(data)


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
            'id', 'event_id', 'lat', 'lng', 'speed', 'heading', 'accuracy', 'altitude',
            'battery', 'is_moving', 'recorded_at', 'created_at',
            'company', 'driver', 'vehicle', 'trip',
        )
        read_only_fields = ('id', 'created_at', 'company', 'driver', 'vehicle', 'trip')
        # Duplicate event_ids are handled explicitly in the ingest view (skip &
        # count), so strip DRF's auto uniqueness validator that would otherwise
        # 400 a legitimate offline retransmit.
        extra_kwargs = {'event_id': {'validators': []}}


class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = ('id', 'timezone', 'distance_unit', 'currency',
                  'offline_timeout_seconds', 'moving_speed_kmh',
                  'telemetry_interval_seconds', 'updated_at')
        read_only_fields = ('id', 'updated_at')

    def validate_offline_timeout_seconds(self, v):
        if v < 10 or v > 86400:
            raise serializers.ValidationError("Offline timeout must be between 10 and 86400 seconds.")
        return v

    def validate_moving_speed_kmh(self, v):
        if v < 0 or v > 300:
            raise serializers.ValidationError("Moving-speed threshold must be between 0 and 300 km/h.")
        return v

    def validate_telemetry_interval_seconds(self, v):
        if v < 5 or v > 3600:
            raise serializers.ValidationError("Telemetry interval must be between 5 and 3600 seconds.")
        return v

    def validate_distance_unit(self, v):
        if v not in ("km", "mi"):
            raise serializers.ValidationError("Distance unit must be 'km' or 'mi'.")
        return v
