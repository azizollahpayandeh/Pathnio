"""
Driver <-> Vehicle assignment service. All validation is server-side; a
cross-company assignment is impossible because both entities are looked up
within the owner's company before we get here, and re-checked here.
"""
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import DriverVehicleAssignment


class AssignmentError(Exception):
    pass


@transaction.atomic
def assign(vehicle, driver, by_user):
    """Make `driver` the active driver of `vehicle`. Ends any prior active
    assignment for that vehicle AND that driver, then creates a fresh one.
    """
    if driver.company_id != vehicle.company_id:
        raise AssignmentError("Driver and vehicle must belong to the same company.")

    now = timezone.now()
    (DriverVehicleAssignment.objects
        .filter(is_active=True)
        .filter(Q(vehicle=vehicle) | Q(driver=driver))
        .update(is_active=False, unassigned_at=now))

    assignment = DriverVehicleAssignment.objects.create(
        company=vehicle.company, driver=driver, vehicle=vehicle,
        assigned_by=by_user, assigned_at=now, is_active=True,
    )

    # Keep denormalized display fields in sync (source of truth = assignment).
    vehicle.driver = driver.full_name
    vehicle.save(update_fields=["driver"])
    driver.plate_number = vehicle.plate_number
    driver.save(update_fields=["plate_number"])
    return assignment


@transaction.atomic
def unassign(vehicle):
    """End the vehicle's active assignment, if any. Returns count ended."""
    now = timezone.now()
    n = (DriverVehicleAssignment.objects
         .filter(vehicle=vehicle, is_active=True)
         .update(is_active=False, unassigned_at=now))
    vehicle.driver = ""
    vehicle.save(update_fields=["driver"])
    return n
