"""
Seed a self-contained live-tracking demo:
  - one manager (Company) account  -> logs into the dashboard /live page
  - one driver account             -> logs into the Pathnio mobile app
  - one vehicle whose plate matches the driver, so the app's GPS pings mirror
    onto it and show up on the live map.

Idempotent: re-running resets passwords and keeps a single set of records.

Usage:  python manage.py seed_live_demo
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Company, Driver, Vehicle, Membership

MANAGER_USERNAME = "manager"
MANAGER_PASSWORD = "Pathnio#Manager1"
DRIVER_USERNAME = "driver1"
DRIVER_PASSWORD = "Pathnio#Driver1"
PLATE = "PN-DEMO-1"


class Command(BaseCommand):
    help = "Create/refresh the live-tracking demo (manager + driver + vehicle)."

    def handle(self, *args, **options):
        # --- Manager + Company ------------------------------------------
        mgr, _ = User.objects.get_or_create(
            username=MANAGER_USERNAME,
            defaults={"email": "manager@pathnio.demo"},
        )
        mgr.set_password(MANAGER_PASSWORD)
        mgr.is_staff = False
        mgr.save()
        company, _ = Company.objects.get_or_create(
            user=mgr,
            defaults={
                "company_name": "Pathnio Demo Co",
                "manager_full_name": "Demo Manager",
                "phone": "0000000000",
            },
        )

        # --- Driver -----------------------------------------------------
        drv_user, _ = User.objects.get_or_create(
            username=DRIVER_USERNAME,
            defaults={"email": "driver1@pathnio.demo"},
        )
        drv_user.set_password(DRIVER_PASSWORD)
        drv_user.save()
        Driver.objects.update_or_create(
            user=drv_user,
            defaults={
                "full_name": "Demo Driver One",
                "mobile": "1111111111",
                "plate_number": PLATE,
                "vehicle_type": "Van",
                "company": company,
            },
        )

        # Authoritative role/tenant records.
        Membership.objects.update_or_create(
            user=mgr, defaults={"company": company,
                                "role": Membership.Role.COMPANY_OWNER})
        Membership.objects.update_or_create(
            user=drv_user, defaults={"company": company,
                                     "role": Membership.Role.DRIVER})

        # --- Vehicle (plate matches the driver) -------------------------
        Vehicle.objects.update_or_create(
            company=company,
            plate_number=PLATE,
            defaults={
                "vehicle_type": "Van",
                "model": "Demo Van",
                "driver": "Demo Driver One",
                "status": "Active",
                "lat": 52.5200,
                "lng": 13.4050,
                "speed": 0,
            },
        )

        self.stdout.write(self.style.SUCCESS("Live demo seeded."))
        self.stdout.write("")
        self.stdout.write("  MANAGER (dashboard /live):")
        self.stdout.write(f"    username: {MANAGER_USERNAME}")
        self.stdout.write(f"    password: {MANAGER_PASSWORD}")
        self.stdout.write("")
        self.stdout.write("  DRIVER (mobile app):")
        self.stdout.write(f"    username: {DRIVER_USERNAME}")
        self.stdout.write(f"    password: {DRIVER_PASSWORD}")
        self.stdout.write(f"    vehicle plate: {PLATE}")
