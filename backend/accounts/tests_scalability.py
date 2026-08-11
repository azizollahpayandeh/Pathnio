"""Phase 19 — telemetry retention: deleting fleet entities must NOT destroy
historical location telemetry (FKs are SET_NULL, not CASCADE)."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Trip, LocationPing,
)


class TelemetryRetentionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Alpha", manager_full_name="A", phone="1")
        self.driver = Driver.objects.create(full_name="D", mobile="1", company=self.company)
        self.vehicle = Vehicle.objects.create(company=self.company, plate_number="A-1", vehicle_type="Van")
        self.trip = Trip.objects.create(company=self.company, origin="A", destination="B",
                                        driver_ref=self.driver, vehicle_ref=self.vehicle)
        self.ping = LocationPing.objects.create(
            company=self.company, driver=self.driver, vehicle=self.vehicle, trip=self.trip,
            lat=52.5, lng=13.4, speed=0, recorded_at="2026-08-11T10:00:00Z")

    def test_deleting_driver_keeps_telemetry(self):
        self.driver.delete()
        self.ping.refresh_from_db()
        self.assertIsNone(self.ping.driver_id)
        self.assertTrue(LocationPing.objects.filter(id=self.ping.id).exists())

    def test_deleting_vehicle_keeps_telemetry(self):
        self.vehicle.delete()
        self.ping.refresh_from_db()
        self.assertIsNone(self.ping.vehicle_id)
        self.assertTrue(LocationPing.objects.filter(id=self.ping.id).exists())

    def test_deleting_trip_keeps_telemetry(self):
        self.trip.delete()
        self.ping.refresh_from_db()
        self.assertIsNone(self.ping.trip_id)
        self.assertTrue(LocationPing.objects.filter(id=self.ping.id).exists())

    def test_telemetry_has_scale_indexes(self):
        # recorded_at-based composite indexes exist for the big table.
        index_fields = [tuple(i.fields) for i in LocationPing._meta.indexes]
        self.assertIn(("company", "recorded_at"), index_fields)
        self.assertIn(("vehicle", "recorded_at"), index_fields)
