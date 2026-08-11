"""
Multi-tenant isolation tests (spec §24).

These lock down the security-critical guarantees: one company can never see or
touch another company's data, and a client can never choose its own company.
"""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from accounts.models import Company, Driver, Vehicle, Membership


class TenantIsolationTests(APITestCase):
    def setUp(self):
        # --- Company A ---
        self.owner_a = User.objects.create_user("ownerA", password="pw")
        self.company_a = Company.objects.create(
            user=self.owner_a, company_name="Alpha Co",
            manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner_a, company=self.company_a,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_a_user = User.objects.create_user("driverA", password="pw")
        self.driver_a = Driver.objects.create(
            user=self.driver_a_user, full_name="Driver A", mobile="1",
            plate_number="A-1", company=self.company_a)
        Membership.objects.create(user=self.driver_a_user, company=self.company_a,
                                  role=Membership.Role.DRIVER)
        self.vehicle_a = Vehicle.objects.create(
            company=self.company_a, plate_number="A-1", vehicle_type="Van")

        # --- Company B ---
        self.owner_b = User.objects.create_user("ownerB", password="pw")
        self.company_b = Company.objects.create(
            user=self.owner_b, company_name="Beta Co",
            manager_full_name="B", phone="2")
        Membership.objects.create(user=self.owner_b, company=self.company_b,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_b_user = User.objects.create_user("driverB", password="pw")
        self.driver_b = Driver.objects.create(
            user=self.driver_b_user, full_name="Driver B", mobile="2",
            plate_number="B-1", company=self.company_b)
        self.vehicle_b = Vehicle.objects.create(
            company=self.company_b, plate_number="B-1", vehicle_type="Truck")

    # 1) Owner A cannot list Company B's drivers.
    def test_owner_cannot_list_other_company_drivers(self):
        self.client.force_authenticate(self.owner_a)
        res = self.client.get("/api/accounts/drivers/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        rows = data["results"] if isinstance(data, dict) else data
        names = [d["full_name"] for d in rows]
        self.assertIn("Driver A", names)
        self.assertNotIn("Driver B", names)

    # 2) Owner A cannot retrieve Company B's vehicle (IDOR -> 404).
    def test_owner_cannot_read_other_company_vehicle(self):
        self.client.force_authenticate(self.owner_a)
        res = self.client.get(f"/api/accounts/vehicles/{self.vehicle_b.id}/")
        self.assertEqual(res.status_code, 404)
        res_own = self.client.get(f"/api/accounts/vehicles/{self.vehicle_a.id}/")
        self.assertEqual(res_own.status_code, 200)

    # 3) A driver cannot create drivers (owner-only endpoint).
    def test_driver_cannot_create_driver(self):
        self.client.force_authenticate(self.driver_a_user)
        res = self.client.post("/api/accounts/register/driver/", {
            "user": {"username": "x", "email": "x@x.com", "password": "Zzz#12345"},
            "full_name": "X", "mobile": "9", "plate_number": "X-9",
        }, format="json")
        self.assertEqual(res.status_code, 403)

    # 4) Owner-created driver is forced into the owner's company even if the
    #    client tries to specify another company_id.
    def test_client_cannot_choose_company_on_driver_create(self):
        self.client.force_authenticate(self.owner_a)
        res = self.client.post("/api/accounts/register/driver/", {
            "user": {"username": "newdrv", "email": "n@x.com", "password": "Zzz#12345"},
            "full_name": "New D", "mobile": "9", "plate_number": "N-9",
            "company": self.company_b.id,   # malicious attempt
        }, format="json")
        self.assertIn(res.status_code, (200, 201))
        new = Driver.objects.get(full_name="New D")
        self.assertEqual(new.company_id, self.company_a.id)  # NOT company_b

    # 5) Vehicle create ignores a client-supplied company.
    def test_client_cannot_choose_company_on_vehicle_create(self):
        self.client.force_authenticate(self.owner_a)
        res = self.client.post("/api/accounts/vehicles/", {
            "plate_number": "NEW-V", "vehicle_type": "Van",
            "company": self.company_b.id,  # malicious attempt
        }, format="json")
        self.assertIn(res.status_code, (200, 201))
        v = Vehicle.objects.get(plate_number="NEW-V")
        self.assertEqual(v.company_id, self.company_a.id)

    # 6) Unauthenticated users cannot submit telemetry.
    def test_unauthenticated_cannot_post_telemetry(self):
        res = self.client.post("/api/accounts/locations/", {
            "lat": 52.5, "lng": 13.4, "speed": 0,
            "recorded_at": "2026-08-10T18:00:00Z",
        }, format="json")
        self.assertIn(res.status_code, (401, 403))
