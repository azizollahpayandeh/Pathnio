"""
Centralized fleet status logic (Phase 10). The backend is the single source of
truth for vehicle/driver status — the frontend never recomputes it.

Thresholds come from each company's CompanySettings (owner-editable on the
Settings page) and fall back to Django settings / built-in defaults. This is
what makes the tracking settings *actually do something*.
"""
from django.conf import settings
from django.utils import timezone

# Global defaults (used when a company has no CompanySettings row yet).
MOVING_SPEED_KMH = getattr(settings, "FLEET_MOVING_SPEED_KMH", 5)
# Must exceed the telemetry reporting interval (~45s on the Eco profile) with
# enough headroom for Android batching / Doze, which routinely delays fixes by
# several minutes. 120s was too tight and reported actively-tracking drivers as
# OFFLINE between batched uploads.
OFFLINE_TIMEOUT_SECONDS = getattr(settings, "FLEET_OFFLINE_TIMEOUT_SECONDS", 300)

# Vehicle operational states
MOVING, STOPPED, OFFLINE, MAINTENANCE, INACTIVE = (
    "MOVING", "STOPPED", "OFFLINE", "MAINTENANCE", "INACTIVE",
)
# Driver states
AVAILABLE, ON_TRIP, DRIVER_OFFLINE, DRIVER_INACTIVE = (
    "AVAILABLE", "ON_TRIP", "OFFLINE", "INACTIVE",
)


def company_thresholds(company):
    """(moving_speed_kmh, offline_timeout_seconds) for a company — from its
    CompanySettings when present, else the global defaults."""
    from .models import CompanySettings
    cs = CompanySettings.objects.filter(company=company).first() if company else None
    if cs:
        return (
            cs.moving_speed_kmh or MOVING_SPEED_KMH,
            cs.offline_timeout_seconds or OFFLINE_TIMEOUT_SECONDS,
        )
    return (MOVING_SPEED_KMH, OFFLINE_TIMEOUT_SECONDS)


def _is_recent(dt, timeout_seconds=OFFLINE_TIMEOUT_SECONDS) -> bool:
    if not dt:
        return False
    return (timezone.now() - dt).total_seconds() <= timeout_seconds


def has_valid_position(vehicle) -> bool:
    """True only when the vehicle has a REAL reported GPS position.

    A vehicle that has never sent telemetry has no position at all (lat/lng are
    NULL) and must never be drawn on the map. 0,0 ("Null Island") is treated as
    invalid because it is the classic uninitialised-coordinate value.
    """
    lat, lng = getattr(vehicle, "lat", None), getattr(vehicle, "lng", None)
    if lat is None or lng is None:
        return False
    if lat == 0 and lng == 0:
        return False
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        return False
    # A real position always comes with the telemetry timestamp that produced it.
    return getattr(vehicle, "last_seen_at", None) is not None


def vehicle_live_status(vehicle, moving_speed=MOVING_SPEED_KMH,
                        offline_timeout=OFFLINE_TIMEOUT_SECONDS) -> str:
    """Derive a vehicle's live status from its operational status + telemetry."""
    if vehicle.status == "Maintenance":
        return MAINTENANCE
    if vehicle.status == "Inactive":
        return INACTIVE
    if not _is_recent(getattr(vehicle, "last_seen_at", None), offline_timeout):
        return OFFLINE
    return MOVING if (vehicle.speed or 0) >= moving_speed else STOPPED


def driver_status(driver, has_active_trip: bool, vehicle=None,
                  offline_timeout=OFFLINE_TIMEOUT_SECONDS) -> str:
    """Derive a driver's status.

    Presence is driven by the DRIVER's own telemetry first: an activated driver
    whose phone is reporting real GPS is online even if no vehicle is assigned
    yet (previously such a driver was wrongly reported OFFLINE). The assigned
    vehicle's recency is still accepted as a fallback signal.
    """
    if not driver.user_id:
        return DRIVER_INACTIVE  # not activated yet

    if has_active_trip:
        return ON_TRIP

    seen = _is_recent(getattr(driver, "last_seen_at", None), offline_timeout) or (
        vehicle is not None
        and _is_recent(getattr(vehicle, "last_seen_at", None), offline_timeout)
    )
    return AVAILABLE if seen else DRIVER_OFFLINE
