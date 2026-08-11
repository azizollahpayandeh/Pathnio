"""
Centralized fleet status logic (Phase 10). The backend is the single source of
truth for vehicle/driver status — the frontend never recomputes it. Thresholds
are configurable via Django settings (env-overridable), not hard-coded across
components.
"""
from django.conf import settings
from django.utils import timezone

# Configurable thresholds (defaults; override in settings/env).
MOVING_SPEED_KMH = getattr(settings, "FLEET_MOVING_SPEED_KMH", 5)
OFFLINE_TIMEOUT_SECONDS = getattr(settings, "FLEET_OFFLINE_TIMEOUT_SECONDS", 120)

# Vehicle operational states
MOVING, STOPPED, OFFLINE, MAINTENANCE, INACTIVE = (
    "MOVING", "STOPPED", "OFFLINE", "MAINTENANCE", "INACTIVE",
)
# Driver states
AVAILABLE, ON_TRIP, DRIVER_OFFLINE, DRIVER_INACTIVE = (
    "AVAILABLE", "ON_TRIP", "OFFLINE", "INACTIVE",
)


def _is_recent(dt) -> bool:
    if not dt:
        return False
    return (timezone.now() - dt).total_seconds() <= OFFLINE_TIMEOUT_SECONDS


def vehicle_live_status(vehicle) -> str:
    """Derive a vehicle's live status from its operational status + telemetry."""
    if vehicle.status == "Maintenance":
        return MAINTENANCE
    if vehicle.status == "Inactive":
        return INACTIVE
    if not _is_recent(getattr(vehicle, "last_seen_at", None)):
        return OFFLINE
    return MOVING if (vehicle.speed or 0) >= MOVING_SPEED_KMH else STOPPED


def driver_status(driver, has_active_trip: bool, vehicle=None) -> str:
    """Derive a driver's status. `has_active_trip` and the assigned vehicle's
    recency are passed in to avoid extra queries in list contexts."""
    if not driver.user_id:
        return DRIVER_INACTIVE  # not activated yet
    if has_active_trip:
        return ON_TRIP
    if vehicle is not None and _is_recent(getattr(vehicle, "last_seen_at", None)):
        return AVAILABLE
    return DRIVER_OFFLINE
