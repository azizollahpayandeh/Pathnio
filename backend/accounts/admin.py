from django.contrib import admin
from .models import (
    Company, Driver, ContactMessage, SiteSettings,
    Alert, Vehicle, Trip, Expense, LocationPing, Membership, DriverInvitation,
    DriverVehicleAssignment, Cargo,
)

admin.site.register(Company)
admin.site.register(Driver)
admin.site.register(ContactMessage)
admin.site.register(SiteSettings)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("plate_number", "model", "vehicle_type", "status", "driver", "company")
    list_filter = ("status", "vehicle_type")
    search_fields = ("plate_number", "model", "driver")


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("origin", "destination", "driver", "plate_number", "status", "revenue", "start_time")
    list_filter = ("status",)
    search_fields = ("origin", "destination", "driver", "plate_number")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "amount", "status", "date", "plate_number")
    list_filter = ("category", "status")
    search_fields = ("title", "plate_number", "driver")


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "alert_type", "priority", "read", "timestamp")
    list_filter = ("priority", "alert_type", "read")


@admin.register(LocationPing)
class LocationPingAdmin(admin.ModelAdmin):
    list_display = ("recorded_at", "vehicle", "driver", "lat", "lng", "speed", "is_moving")
    list_filter = ("is_moving", "company")
    search_fields = ("vehicle__plate_number", "driver__full_name")
    date_hierarchy = "recorded_at"


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "company", "role", "created_at")
    list_filter = ("role", "company")
    search_fields = ("user__username", "company__company_name")


@admin.register(DriverInvitation)
class DriverInvitationAdmin(admin.ModelAdmin):
    list_display = ("driver", "company", "status", "created_at", "expires_at", "used_at")
    list_filter = ("status", "company")
    search_fields = ("driver__full_name", "company__company_name")
    readonly_fields = ("token_hash", "created_at", "used_at", "revoked_at")


@admin.register(DriverVehicleAssignment)
class DriverVehicleAssignmentAdmin(admin.ModelAdmin):
    list_display = ("driver", "vehicle", "company", "is_active", "assigned_at", "unassigned_at")
    list_filter = ("is_active", "company")
    search_fields = ("driver__full_name", "vehicle__plate_number")


@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ("description", "trip", "company", "quantity", "weight_kg")
    list_filter = ("company",)
    search_fields = ("description", "trip__origin", "trip__destination")
