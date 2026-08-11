"""
Fleet alert generation from REAL data (Phase 12). No fabricated notifications:
alerts are created only when a genuine condition exists, and de-duplicated so a
single ongoing condition produces one open alert per (vehicle, type).
"""
from django.conf import settings

from .models import FleetAlert, Vehicle
from .fleet_status import vehicle_live_status, company_thresholds, OFFLINE

LOW_FUEL_THRESHOLD = getattr(settings, "FLEET_LOW_FUEL_THRESHOLD", 15)


def _open_exists(company, vehicle, atype):
    return FleetAlert.objects.filter(
        company=company, vehicle=vehicle, alert_type=atype,
        acknowledged_at__isnull=True,
    ).exists()


def refresh_fleet_alerts(company) -> int:
    """Scan the company's vehicles and open alerts for current real conditions.
    Returns the number of new alerts created."""
    created = 0
    moving_speed, offline_timeout = company_thresholds(company)
    for v in Vehicle.objects.filter(company=company):
        if v.status == "Maintenance" and not _open_exists(company, v, FleetAlert.Type.MAINTENANCE_DUE):
            FleetAlert.objects.create(
                company=company, vehicle=v, alert_type=FleetAlert.Type.MAINTENANCE_DUE,
                severity=FleetAlert.Severity.HIGH,
                title=f"{v.plate_number} in maintenance",
                message=f"Vehicle {v.plate_number} ({v.model}) is flagged for maintenance.")
            created += 1

        if (v.status == "Active" and (v.fuel_level if v.fuel_level is not None else 100) < LOW_FUEL_THRESHOLD
                and not _open_exists(company, v, FleetAlert.Type.LOW_FUEL)):
            FleetAlert.objects.create(
                company=company, vehicle=v, alert_type=FleetAlert.Type.LOW_FUEL,
                severity=FleetAlert.Severity.CRITICAL,
                title=f"{v.plate_number} low fuel",
                message=f"Fuel level for {v.plate_number} is at {v.fuel_level}%.")
            created += 1

        # Only alert offline for vehicles that HAVE reported before (real signal).
        if (v.status == "Active" and v.last_seen_at is not None
                and vehicle_live_status(v, moving_speed, offline_timeout) == OFFLINE
                and not _open_exists(company, v, FleetAlert.Type.VEHICLE_OFFLINE)):
            FleetAlert.objects.create(
                company=company, vehicle=v, alert_type=FleetAlert.Type.VEHICLE_OFFLINE,
                severity=FleetAlert.Severity.MEDIUM,
                title=f"{v.plate_number} went offline",
                message=f"No recent telemetry from {v.plate_number}.")
            created += 1

    return created
