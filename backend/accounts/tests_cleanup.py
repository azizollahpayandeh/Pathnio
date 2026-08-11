"""Regression coverage for the production cleanup / consistency slice.

Guarantees the backend upholds the invariants the frontend relies on so that no
page can ever fall back to demo data:
  * a fresh company's drivers / vehicles / live feed are EMPTY (no demo seed)
  * lists are strictly company-scoped (the driver dropdown shows only my drivers)
  * a real new driver appears immediately; demo names never do
  * driver status is SYSTEM-DERIVED (activation + trip + telemetry), never
    settable by the client, and Driver no longer exposes a fabricated rating
  * vehicle create returns a useful field error on failure and 201 on success
  * company settings persist, are validated, are tenant-isolated, AND actually
    drive the live-status thresholds
"""
from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Membership, DriverVehicleAssignment,
    Trip, CompanySettings,
)


class TwoCompanies(APITestCase):
    def setUp(self):
        self.oa = User.objects.create_user("oa", password="pw123456")
        self.ca = Company.objects.create(user=self.oa, company_name="A", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.oa, company=self.ca, role=Membership.Role.COMPANY_OWNER)
        self.ob = User.objects.create_user("ob", password="pw123456")
        self.cb = Company.objects.create(user=self.ob, company_name="B", manager_full_name="B", phone="2")
        Membership.objects.create(user=self.ob, company=self.cb, role=Membership.Role.COMPANY_OWNER)


class EmptyStateTests(TwoCompanies):
    """A brand-new company must see NOTHING — never demo data."""

    def test_new_company_drivers_empty(self):
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/drivers/")
        rows = r.json().get("results", r.json())
        self.assertEqual(rows, [])

    def test_new_company_vehicles_empty(self):
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/vehicles/")
        rows = r.json().get("results", r.json())
        self.assertEqual(rows, [])

    def test_new_company_live_feed_empty(self):
        # Live Map: zero vehicles -> empty feed, no static/demo markers.
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/vehicles/live/")
        self.assertEqual(r.json(), [])


class DriverDropdownTests(TwoCompanies):
    def test_driver_list_is_company_scoped_and_shows_new_driver(self):
        # A real new driver in A appears; B's driver never leaks into A's list.
        Driver.objects.create(full_name="Arsalan", mobile="1", company=self.ca)
        Driver.objects.create(full_name="Other Co Driver", mobile="2", company=self.cb)
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/drivers/")
        rows = r.json().get("results", r.json())
        names = [d["full_name"] for d in rows]
        self.assertEqual(names, ["Arsalan"])
        self.assertNotIn("Other Co Driver", names)

    def test_created_driver_appears_immediately(self):
        self.client.force_authenticate(self.oa)
        c = self.client.post("/api/accounts/drivers/", {"full_name": "New Guy", "mobile": "5"}, format="json")
        self.assertEqual(c.status_code, 201)
        r = self.client.get("/api/accounts/drivers/")
        rows = r.json().get("results", r.json())
        self.assertIn("New Guy", [d["full_name"] for d in rows])


class DriverStatusTests(TwoCompanies):
    def _recent(self):
        return timezone.now() - timedelta(seconds=5)

    def _stale(self):
        return timezone.now() - timedelta(seconds=6000)

    def test_status_field_present_no_rating(self):
        Driver.objects.create(full_name="D", mobile="1", company=self.ca)
        self.client.force_authenticate(self.oa)
        row = self.client.get("/api/accounts/drivers/").json()
        row = row.get("results", row)[0]
        self.assertIn("status", row)
        self.assertIn("activated", row)
        self.assertNotIn("rating", row)  # fabricated rating removed

    def test_profile_only_driver_is_inactive(self):
        Driver.objects.create(full_name="Unactivated", mobile="1", company=self.ca)
        self.client.force_authenticate(self.oa)
        row = self.client.get("/api/accounts/drivers/").json()
        row = row.get("results", row)[0]
        self.assertEqual(row["status"], "Inactive")
        self.assertFalse(row["activated"])

    def test_client_cannot_set_status(self):
        # Even if a client sends status, it is derived (ignored) — a profile-only
        # driver stays Inactive regardless of what was posted.
        self.client.force_authenticate(self.oa)
        c = self.client.post("/api/accounts/drivers/",
                             {"full_name": "X", "mobile": "9", "status": "Active"}, format="json")
        self.assertEqual(c.status_code, 201)
        self.assertEqual(c.json()["status"], "Inactive")

    def test_activated_driver_with_recent_telemetry_is_active(self):
        mob = User.objects.create_user("mob1", password="pw123456")
        d = Driver.objects.create(user=mob, full_name="Live", mobile="1", company=self.ca)
        v = Vehicle.objects.create(company=self.ca, plate_number="A-1", vehicle_type="Van",
                                   status="Active", speed=0, last_seen_at=self._recent())
        DriverVehicleAssignment.objects.create(company=self.ca, driver=d, vehicle=v, is_active=True)
        self.client.force_authenticate(self.oa)
        row = self.client.get("/api/accounts/drivers/").json()
        row = row.get("results", row)[0]
        self.assertEqual(row["status"], "Active")
        self.assertTrue(row["activated"])

    def test_activated_driver_on_active_trip_is_on_trip(self):
        mob = User.objects.create_user("mob2", password="pw123456")
        d = Driver.objects.create(user=mob, full_name="Tripper", mobile="1", company=self.ca)
        v = Vehicle.objects.create(company=self.ca, plate_number="A-2", vehicle_type="Van",
                                   status="Active", last_seen_at=self._recent())
        DriverVehicleAssignment.objects.create(company=self.ca, driver=d, vehicle=v, is_active=True)
        Trip.objects.create(company=self.ca, origin="X", destination="Y",
                            driver_ref=d, vehicle_ref=v, status="ACTIVE")
        self.client.force_authenticate(self.oa)
        row = self.client.get("/api/accounts/drivers/").json()
        row = row.get("results", row)[0]
        self.assertEqual(row["status"], "On Trip")

    def test_activated_driver_stale_telemetry_is_offline(self):
        mob = User.objects.create_user("mob3", password="pw123456")
        d = Driver.objects.create(user=mob, full_name="Gone", mobile="1", company=self.ca)
        v = Vehicle.objects.create(company=self.ca, plate_number="A-3", vehicle_type="Van",
                                   status="Active", last_seen_at=self._stale())
        DriverVehicleAssignment.objects.create(company=self.ca, driver=d, vehicle=v, is_active=True)
        self.client.force_authenticate(self.oa)
        row = self.client.get("/api/accounts/drivers/").json()
        row = row.get("results", row)[0]
        self.assertEqual(row["status"], "Offline")


class VehicleCreateTests(TwoCompanies):
    def test_create_success_returns_201_and_appears(self):
        self.client.force_authenticate(self.oa)
        c = self.client.post("/api/accounts/vehicles/",
                             {"plate_number": "PN-1", "vehicle_type": "Van", "model": "Clean",
                              "color": "Blue", "capacity": "2 t", "status": "Active"}, format="json")
        self.assertEqual(c.status_code, 201)
        r = self.client.get("/api/accounts/vehicles/")
        rows = r.json().get("results", r.json())
        self.assertIn("PN-1", [v["plate_number"] for v in rows])

    def test_duplicate_plate_returns_useful_field_error(self):
        Vehicle.objects.create(company=self.ca, plate_number="DUP-1", vehicle_type="Van")
        self.client.force_authenticate(self.oa)
        c = self.client.post("/api/accounts/vehicles/",
                             {"plate_number": "DUP-1", "vehicle_type": "Van"}, format="json")
        self.assertEqual(c.status_code, 400)
        # a field-scoped, human-readable message (never a stack trace)
        self.assertIn("plate_number", c.json())


class SettingsBehaviourTests(TwoCompanies):
    def test_settings_persist(self):
        self.client.force_authenticate(self.oa)
        self.client.patch("/api/accounts/company/settings/", {"moving_speed_kmh": 12}, format="json")
        # a fresh GET (as a new request) returns the saved value
        r = self.client.get("/api/accounts/company/settings/")
        self.assertEqual(r.json()["moving_speed_kmh"], 12)

    def test_settings_company_isolated(self):
        self.client.force_authenticate(self.oa)
        self.client.patch("/api/accounts/company/settings/", {"moving_speed_kmh": 30}, format="json")
        self.client.force_authenticate(self.ob)
        r = self.client.get("/api/accounts/company/settings/")
        self.assertNotEqual(r.json()["moving_speed_kmh"], 30)

    def test_settings_validation_rejects_bad_values(self):
        self.client.force_authenticate(self.oa)
        r = self.client.patch("/api/accounts/company/settings/",
                             {"offline_timeout_seconds": 3}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_moving_speed_threshold_actually_drives_live_status(self):
        # Prove the setting is USED, not just stored: same vehicle/speed, two
        # thresholds -> two different live statuses.
        v = Vehicle.objects.create(company=self.ca, plate_number="A-9", vehicle_type="Van",
                                   status="Active", speed=3, last_seen_at=timezone.now())
        self.client.force_authenticate(self.oa)

        self.client.patch("/api/accounts/company/settings/", {"moving_speed_kmh": 10}, format="json")
        r = self.client.get("/api/accounts/vehicles/live/")
        self.assertEqual(r.json()[0]["live_status"], "STOPPED")  # 3 < 10

        self.client.patch("/api/accounts/company/settings/", {"moving_speed_kmh": 2}, format="json")
        r = self.client.get("/api/accounts/vehicles/live/")
        self.assertEqual(r.json()[0]["live_status"], "MOVING")   # 3 >= 2
