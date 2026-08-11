"""Phase 6 — cargo tests (tenant isolation + trip company validation)."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import Company, Membership, Trip, Cargo


class CargoTests(APITestCase):
    def setUp(self):
        self.owner_a = User.objects.create_user("ownerA", password="pw123456")
        self.company_a = Company.objects.create(
            user=self.owner_a, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner_a, company=self.company_a,
                                  role=Membership.Role.COMPANY_OWNER)
        self.trip_a = Trip.objects.create(company=self.company_a, origin="A", destination="B")

        self.owner_b = User.objects.create_user("ownerB", password="pw123456")
        self.company_b = Company.objects.create(
            user=self.owner_b, company_name="Beta", manager_full_name="B", phone="2")
        Membership.objects.create(user=self.owner_b, company=self.company_b,
                                  role=Membership.Role.COMPANY_OWNER)
        self.trip_b = Trip.objects.create(company=self.company_b, origin="C", destination="D")

    def test_owner_creates_cargo_for_own_trip(self):
        self.client.force_authenticate(self.owner_a)
        r = self.client.post("/api/accounts/cargo/", {
            "trip": self.trip_a.id, "description": "Electronics",
            "cargo_type": "General", "weight_kg": "1200.50", "quantity": 3,
        }, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        c = Cargo.objects.get(id=r.json()["id"])
        self.assertEqual(c.company_id, self.company_a.id)

    def test_cargo_rejects_other_company_trip(self):
        self.client.force_authenticate(self.owner_a)
        r = self.client.post("/api/accounts/cargo/", {
            "trip": self.trip_b.id, "description": "X",
        }, format="json")
        self.assertEqual(r.status_code, 400)

    def test_cargo_list_company_scoped(self):
        Cargo.objects.create(company=self.company_a, trip=self.trip_a, description="mine")
        Cargo.objects.create(company=self.company_b, trip=self.trip_b, description="theirs")
        self.client.force_authenticate(self.owner_a)
        r = self.client.get("/api/accounts/cargo/")
        rows = r.json().get("results", r.json())
        self.assertEqual([c["description"] for c in rows], ["mine"])

    def test_cargo_nested_in_trip(self):
        Cargo.objects.create(company=self.company_a, trip=self.trip_a, description="pallet")
        self.client.force_authenticate(self.owner_a)
        r = self.client.get(f"/api/accounts/trips/{self.trip_a.id}/")
        self.assertEqual(len(r.json()["cargos"]), 1)
        self.assertEqual(r.json()["cargos"][0]["description"], "pallet")
