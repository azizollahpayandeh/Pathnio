"""Phase 5 — trips tests (company scope + same-company driver/vehicle refs)."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import Company, Driver, Vehicle, Membership, Trip


class TripTests(APITestCase):
    def setUp(self):
        self.owner_a = User.objects.create_user("ownerA", password="pw123456")
        self.company_a = Company.objects.create(
            user=self.owner_a, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner_a, company=self.company_a,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_a = Driver.objects.create(full_name="Driver A", mobile="1", company=self.company_a)
        self.vehicle_a = Vehicle.objects.create(company=self.company_a, plate_number="A-1", vehicle_type="Van")

        self.owner_b = User.objects.create_user("ownerB", password="pw123456")
        self.company_b = Company.objects.create(
            user=self.owner_b, company_name="Beta", manager_full_name="B", phone="2")
        Membership.objects.create(user=self.owner_b, company=self.company_b,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_b = Driver.objects.create(full_name="Driver B", mobile="2", company=self.company_b)

    def test_owner_creates_trip_with_refs(self):
        self.client.force_authenticate(self.owner_a)
        r = self.client.post("/api/accounts/trips/", {
            "origin": "Berlin", "destination": "Hamburg",
            "driver_ref": self.driver_a.id, "vehicle_ref": self.vehicle_a.id,
            "status": "PLANNED",
        }, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        t = Trip.objects.get(id=r.json()["id"])
        self.assertEqual(t.company_id, self.company_a.id)
        self.assertEqual(t.created_by_id, self.owner_a.id)
        self.assertEqual(t.driver, "Driver A")        # legacy synced
        self.assertEqual(t.plate_number, "A-1")

    def test_trip_rejects_other_company_driver(self):
        self.client.force_authenticate(self.owner_a)
        r = self.client.post("/api/accounts/trips/", {
            "origin": "X", "destination": "Y",
            "driver_ref": self.driver_b.id,  # company B driver
        }, format="json")
        self.assertEqual(r.status_code, 400)

    def test_trip_list_is_company_scoped(self):
        Trip.objects.create(company=self.company_a, origin="A", destination="B")
        Trip.objects.create(company=self.company_b, origin="C", destination="D")
        self.client.force_authenticate(self.owner_a)
        r = self.client.get("/api/accounts/trips/")
        rows = r.json().get("results", r.json())
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["origin"], "A")

    def test_owner_cannot_read_other_company_trip(self):
        t = Trip.objects.create(company=self.company_b, origin="C", destination="D")
        self.client.force_authenticate(self.owner_a)
        r = self.client.get(f"/api/accounts/trips/{t.id}/")
        self.assertEqual(r.status_code, 404)
