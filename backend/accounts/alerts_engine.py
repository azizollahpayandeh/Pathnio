"""
Fleet alert generation from REAL data (Phase 12). No fabricated notifications:
alerts are created only when a genuine condition exists.

De-duplication keys on the CONDITION lifecycle, never on the read state:
an alert stays "unresolved" from the moment the condition appears until it
clears. Marking an alert as read (acknowledged_at) is display state only —
previously it made the de-dup check miss, so acknowledging an alert for a
still-true condition immediately recreated it (duplicate notifications).
"""
from django.conf import settings
from django.utils import timezone

from .models import FleetAlert, Vehicle
from .fleet_status import vehicle_live_status, company_thresholds, OFFLINE

LOW_FUEL_THRESHOLD = getattr(settings, "FLEET_LOW_FUEL_THRESHOLD", 15)


def _unresolved(company, vehicle, atype):
    """Any still-open occurrence of this condition, read or not."""
    return FleetAlert.objects.filter(
        company=company, vehicle=vehicle, alert_type=atype,
        resolved_at__isnull=True,
    )


def _open_alert(company, vehicle, atype, severity, title, message) -> bool:
    """Create the alert only if this condition is not already open."""
    if _unresolved(company, vehicle, atype).exists():
        return False
    FleetAlert.objects.create(
        company=company, vehicle=vehicle, alert_type=atype,
        severity=severity, title=title, message=message)
    return True


def _resolve(company, vehicle, atype) -> int:
    """Condition cleared: close any open occurrence so a genuine future
    re-occurrence can raise a fresh alert."""
    return _unresolved(company, vehicle, atype).update(resolved_at=timezone.now())


def refresh_fleet_alerts(company) -> int:
    """Scan the company's vehicles, open alerts for current real conditions and
    resolve the ones whose condition no longer holds. Returns alerts created."""
    created = 0
    moving_speed, offline_timeout = company_thresholds(company)

    for v in Vehicle.objects.filter(company=company):
        # --- maintenance -------------------------------------------------
        if v.status == "Maintenance":
            created += _open_alert(
                company, v, FleetAlert.Type.MAINTENANCE_DUE,
                FleetAlert.Severity.HIGH,
                f"{v.plate_number} in maintenance",
                f"Vehicle {v.plate_number} ({v.model}) is flagged for maintenance.")
        else:
            _resolve(company, v, FleetAlert.Type.MAINTENANCE_DUE)

        # --- low fuel ----------------------------------------------------
        fuel = v.fuel_level if v.fuel_level is not None else 100
        if v.status == "Active" and fuel < LOW_FUEL_THRESHOLD:
            created += _open_alert(
                company, v, FleetAlert.Type.LOW_FUEL,
                FleetAlert.Severity.CRITICAL,
                f"{v.plate_number} low fuel",
                f"Fuel level for {v.plate_number} is at {fuel}%.")
        else:
            _resolve(company, v, FleetAlert.Type.LOW_FUEL)

        # --- offline (only for vehicles that HAVE reported before) --------
        is_offline = (
            v.status == "Active" and v.last_seen_at is not None
            and vehicle_live_status(v, moving_speed, offline_timeout) == OFFLINE
        )
        if is_offline:
            created += _open_alert(
                company, v, FleetAlert.Type.VEHICLE_OFFLINE,
                FleetAlert.Severity.MEDIUM,
                f"{v.plate_number} went offline",
                f"No recent telemetry from {v.plate_number}.")
        else:
            _resolve(company, v, FleetAlert.Type.VEHICLE_OFFLINE)

    return created
