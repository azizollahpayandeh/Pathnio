"""Phase 7 — telemetry hardening tests (idempotency, trip link, latest state)."""
import uuid
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Membership, DriverVehicleAssignment, Trip, LocationPing,
)

LOC = "/api/accounts/locations/"


class TelemetryTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.mob = User.objects.create_user("mob", password="pw123456")
        self.driver = Driver.objects.create(user=self.mob, full_name="D", mobile="1",
                                            company=self.company)
        Membership.objects.create(user=self.mob, company=self.company,
                                  role=Membership.Role.DRIVER)
        self.vehicle = Vehicle.objects.create(company=self.company, plate_number="A-1",
                                              vehicle_type="Van")
        DriverVehicleAssignment.objects.create(company=self.company, driver=self.driver,
                                               vehicle=self.vehicle, is_active=True)

    def test_idempotent_event_id(self):
        self.client.force_authenticate(self.mob)
        eid = str(uuid.uuid4())
        body = {"locations": [{"event_id": eid, "lat": 52.5, "lng": 13.4, "speed": 5,
                               "recorded_at": "2026-08-11T10:00:00Z"}]}
        r1 = self.client.post(LOC, body, format="json")
        r2 = self.client.post(LOC, body, format="json")   # retransmit
        self.assertEqual(r1.json()["saved"], 1)
        self.assertEqual(r2.json()["saved"], 0)
        self.assertEqual(r2.json()["duplicates"], 1)
        self.assertEqual(LocationPing.objects.filter(event_id=eid).count(), 1)

    def test_telemetry_links_active_trip(self):
        trip = Trip.objects.create(company=self.company, origin="A", destination="B",
                                   driver_ref=self.driver, vehicle_ref=self.vehicle,
                                   status="ACTIVE")
        self.client.force_authenticate(self.mob)
        r = self.client.post(LOC, {"locations": [
            {"lat": 52.5, "lng": 13.4, "speed": 5, "recorded_at": "2026-08-11T10:05:00Z"}]},
            format="json")
        self.assertEqual(r.json()["trip"], trip.id)
        self.assertEqual(LocationPing.objects.latest("id").trip_id, trip.id)

    def test_latest_state_updates_last_seen(self):
        self.client.force_authenticate(self.mob)
        self.client.post(LOC, {"locations": [
            {"lat": 52.5, "lng": 13.4, "speed": 10, "recorded_at": "2026-08-11T10:10:00Z"}]},
            format="json")
        self.vehicle.refresh_from_db()
        self.assertIsNotNone(self.vehicle.last_seen_at)
        self.assertEqual(self.vehicle.speed, 36)  # 10 m/s -> 36 km/h

    def test_unauthenticated_rejected(self):
        r = self.client.post(LOC, {"lat": 1, "lng": 2, "speed": 0,
                                   "recorded_at": "2026-08-11T10:00:00Z"}, format="json")
        self.assertIn(r.status_code, (401, 403))
