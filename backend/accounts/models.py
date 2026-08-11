import uuid
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
    # user is nullable: an owner can create a driver PROFILE first; the login
    # account is linked later at activation (Phase 3 invitation flow).
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='driver_profile')
    full_name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
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

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    def __str__(self):
        return f"Profile - {self.user.username}"

class Alert(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    ALERT_TYPE_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('password_change', 'Password Change'),
        ('profile_update', 'Profile Update'),
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        ('security_issue', 'Security Issue'),
        ('failed_login', 'Failed Login'),
        ('account_locked', 'Account Locked'),
        ('system', 'System Alert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    read = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'read', 'timestamp']),
            models.Index(fields=['alert_type', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title} - {self.priority}"


class Vehicle(models.Model):
    STATUS_CHOICES = [("Active", "Active"), ("Inactive", "Inactive"), ("Maintenance", "Maintenance")]
    TYPE_CHOICES = [("Truck", "Truck"), ("Van", "Van"), ("Sedan", "Sedan"), ("Pickup", "Pickup")]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="vehicles", null=True, blank=True)
    plate_number = models.CharField(max_length=32)
    vehicle_type = models.CharField(max_length=16, choices=TYPE_CHOICES, default="Truck")
    model = models.CharField(max_length=128, blank=True)
    driver = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="Active")
    capacity = models.CharField(max_length=32, blank=True)
    color = models.CharField(max_length=32, blank=True)
    fuel_level = models.PositiveIntegerField(default=100)
    odometer = models.PositiveIntegerField(default=0)
    efficiency = models.CharField(max_length=32, blank=True)
    last_maintenance = models.DateField(null=True, blank=True)
    total_trips = models.PositiveIntegerField(default=0)
    lat = models.FloatField(default=0)
    lng = models.FloatField(default=0)
    speed = models.PositiveIntegerField(default=0)
    last_seen_at = models.DateTimeField(null=True, blank=True)  # last telemetry received
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.plate_number} ({self.model})"


class Trip(models.Model):
    STATUS_CHOICES = [
        ("PLANNED", "Planned"), ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"), ("CANCELLED", "Cancelled"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="trips", null=True, blank=True)
    origin = models.CharField(max_length=128)
    destination = models.CharField(max_length=128)
    # Real relationships (source of truth); legacy strings kept in sync for display.
    driver_ref = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name="trips")
    vehicle_ref = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name="trips")
    driver = models.CharField(max_length=255, blank=True)       # legacy display
    plate_number = models.CharField(max_length=32, blank=True)  # legacy display
    distance = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="PLANNED")
    cargo = models.CharField(max_length=128, blank=True)        # legacy; Cargo model in Phase 6
    revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_trips")
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=["company", "status"]),
            models.Index(fields=["driver_ref", "status"]),
        ]

    def __str__(self):
        return f"{self.origin} -> {self.destination} ({self.status})"


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("Fuel", "Fuel"), ("Maintenance", "Maintenance"), ("Tolls", "Tolls"),
        ("Parking", "Parking"), ("Insurance", "Insurance"), ("Salary", "Salary"),
        ("Repair", "Repair"), ("Other", "Other"),
    ]
    STATUS_CHOICES = [("Paid", "Paid"), ("Pending", "Pending")]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="expenses", null=True, blank=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=16, choices=CATEGORY_CHOICES, default="Fuel")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="EUR")
    date = models.DateField(default=timezone.now)
    # Optional real references (kept alongside legacy display strings).
    vehicle_ref = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses")
    driver_ref = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses")
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses")
    plate_number = models.CharField(max_length=32, blank=True)
    driver = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="Paid")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.title} - {self.amount}"


class LocationPing(models.Model):
    """A single GPS fix reported by the Pathnio driver mobile app.

    The app posts fixes (usually in small batches) to the location-ingest
    endpoint. Each fix is stored here as breadcrumb history, and the latest
    fix is mirrored onto the matching Vehicle (lat/lng/speed) so the live
    dashboard map updates without needing a websocket layer.
    """
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="location_pings", null=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, related_name="location_pings", null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, related_name="location_pings", null=True, blank=True)
    # Trip this fix belongs to (the driver's active trip at receive time).
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, related_name="location_pings", null=True, blank=True)
    # Client-generated idempotency key so retransmitted offline fixes don't
    # create duplicate rows (unique when present — enforced below).
    event_id = models.UUIDField(null=True, blank=True, db_index=True)

    lat = models.FloatField()
    lng = models.FloatField()
    speed = models.FloatField(default=0)          # metres/second, straight from GPS
    heading = models.FloatField(null=True, blank=True)   # degrees, 0-360
    accuracy = models.FloatField(null=True, blank=True)  # metres
    altitude = models.FloatField(null=True, blank=True)  # metres
    battery = models.IntegerField(null=True, blank=True)  # 0-100
    is_moving = models.BooleanField(default=True)

    recorded_at = models.DateTimeField()          # device clock (when the fix was taken)
    created_at = models.DateTimeField(auto_now_add=True)  # server clock (when it arrived)

    class Meta:
        ordering = ["-recorded_at"]
        indexes = [
            models.Index(fields=["company", "recorded_at"]),
            models.Index(fields=["vehicle", "recorded_at"]),
            models.Index(fields=["driver", "recorded_at"]),
            models.Index(fields=["trip", "recorded_at"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["event_id"],
                                    condition=models.Q(event_id__isnull=False),
                                    name="uniq_location_event_id"),
        ]

    def __str__(self):
        return f"{self.lat:.5f},{self.lng:.5f} @ {self.recorded_at:%Y-%m-%d %H:%M:%S}"


class Membership(models.Model):
    """Authoritative link between a user, the company (tenant) they belong to,
    and their role. This is the single source of truth the backend uses to
    decide tenant access — never trust a company_id from the client.

    Kept as a OneToOne(user) for now (one company per user); can become a
    ForeignKey later if multi-company membership is ever needed. The existing
    Company.user / Driver.company relations remain as profile data and are kept
    in sync with this model.
    """
    class Role(models.TextChoices):
        COMPANY_OWNER = "COMPANY_OWNER", "Company Owner"
        COMPANY_ADMIN = "COMPANY_ADMIN", "Company Admin"
        DISPATCHER = "DISPATCHER", "Dispatcher"
        FLEET_MANAGER = "FLEET_MANAGER", "Fleet Manager"
        ACCOUNTANT = "ACCOUNTANT", "Accountant"
        DRIVER = "DRIVER", "Driver"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="membership")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=32, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["company", "role"]),
        ]

    def __str__(self):
        return f"{self.user.username} @ {self.company.company_name} ({self.role})"


class DriverInvitation(models.Model):
    """A secure, single-use, expiring token that binds a mobile user account to
    a specific Driver + Company at activation time.

    The RAW token is shown to the owner exactly once and never stored — only its
    SHA-256 hash lives here, so a database read can't reveal usable codes.
    """
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        USED = "USED", "Used"
        REVOKED = "REVOKED", "Revoked"

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="invitations")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="driver_invitations")
    token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_driver_invitations")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "status"]),
            models.Index(fields=["driver", "status"]),
        ]

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    @property
    def is_active(self) -> bool:
        return self.status == self.Status.PENDING and not self.is_expired

    def __str__(self):
        return f"invite<{self.driver.full_name} / {self.company.company_name} / {self.status}>"


class DriverVehicleAssignment(models.Model):
    """History of which driver is assigned to which vehicle. Exactly one row per
    (vehicle) and per (driver) may be active at a time — enforced by partial
    unique constraints. Cross-company assignment is impossible (validated in the
    service layer, and both FKs carry the same company)."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="assignments")
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="assignments")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="assignments")
    assigned_at = models.DateTimeField(default=timezone.now)
    unassigned_at = models.DateTimeField(null=True, blank=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="made_assignments")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-assigned_at"]
        constraints = [
            models.UniqueConstraint(fields=["vehicle"], condition=models.Q(is_active=True),
                                    name="uniq_active_vehicle_assignment"),
            models.UniqueConstraint(fields=["driver"], condition=models.Q(is_active=True),
                                    name="uniq_active_driver_assignment"),
        ]
        indexes = [
            models.Index(fields=["company", "is_active"]),
            models.Index(fields=["vehicle", "is_active"]),
            models.Index(fields=["driver", "is_active"]),
        ]

    def __str__(self):
        state = "active" if self.is_active else "ended"
        return f"assign<{self.driver.full_name} -> {self.vehicle.plate_number} ({state})>"


class Cargo(models.Model):
    """A load/cargo item carried on a trip. Tenant-isolated via company (and the
    parent trip's company). A trip may carry several cargo items."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="cargos")
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="cargos")
    description = models.CharField(max_length=255)
    cargo_type = models.CharField(max_length=64, blank=True)
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    pickup_location = models.CharField(max_length=255, blank=True)
    delivery_location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["company"]), models.Index(fields=["trip"])]

    def __str__(self):
        return f"cargo<{self.description} x{self.quantity}>"


class FleetAlert(models.Model):
    """Operational fleet alert, derived from real telemetry/fleet data (never
    fabricated). Company-scoped; one OPEN alert per (vehicle, type) at a time."""
    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Type(models.TextChoices):
        VEHICLE_OFFLINE = "VEHICLE_OFFLINE", "Vehicle offline"
        MAINTENANCE_DUE = "MAINTENANCE_DUE", "Maintenance due"
        LOW_FUEL = "LOW_FUEL", "Low fuel"
        SPEEDING = "SPEEDING", "Excessive speed"
        GPS_UNAVAILABLE = "GPS_UNAVAILABLE", "GPS unavailable"
        OTHER = "OTHER", "Other"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="fleet_alerts")
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    alert_type = models.CharField(max_length=32, choices=Type.choices, default=Type.OTHER)
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name="fleet_alerts")
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name="fleet_alerts")
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name="fleet_alerts")
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "acknowledged_at"]),
            models.Index(fields=["vehicle", "alert_type", "acknowledged_at"]),
        ]

    def __str__(self):
        return f"alert<{self.alert_type} / {self.severity}>"
