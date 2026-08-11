"""Phase 4 — driver <-> vehicle assignment tests."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import Company, Driver, Vehicle, Membership, DriverVehicleAssignment


class AssignmentTests(APITestCase):
    def setUp(self):
        self.owner_a = User.objects.create_user("ownerA", password="pw123456")
        self.company_a = Company.objects.create(
            user=self.owner_a, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner_a, company=self.company_a,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_a = Driver.objects.create(full_name="Driver A", mobile="1",
                                              plate_number="", company=self.company_a)
        self.vehicle_a = Vehicle.objects.create(company=self.company_a,
                                                plate_number="A-1", vehicle_type="Van")

        self.owner_b = User.objects.create_user("ownerB", password="pw123456")
        self.company_b = Company.objects.create(
            user=self.owner_b, company_name="Beta", manager_full_name="B", phone="2")
        Membership.objects.create(user=self.owner_b, company=self.company_b,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_b = Driver.objects.create(full_name="Driver B", mobile="2",
                                              plate_number="", company=self.company_b)
        self.vehicle_b = Vehicle.objects.create(company=self.company_b,
                                                plate_number="B-1", vehicle_type="Truck")

    def _assign(self, owner, vehicle, driver):
        self.client.force_authenticate(owner)
        return self.client.post(f"/api/accounts/vehicles/{vehicle.id}/assign/",
                                {"driver_id": driver.id}, format="json")

    def test_owner_can_assign_same_company(self):
        r = self._assign(self.owner_a, self.vehicle_a, self.driver_a)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["assigned_driver"]["id"], self.driver_a.id)
        self.assertTrue(DriverVehicleAssignment.objects.filter(
            vehicle=self.vehicle_a, driver=self.driver_a, is_active=True).exists())

    def test_cross_company_assignment_blocked(self):
        # owner A tries to attach company B's driver to A's vehicle
        r = self.client.post(f"/api/accounts/vehicles/{self.vehicle_a.id}/assign/",
                             {"driver_id": self.driver_b.id}, format="json")
        # unauthenticated
        self.assertIn(r.status_code, (401, 403))
        self.client.force_authenticate(self.owner_a)
        r2 = self.client.post(f"/api/accounts/vehicles/{self.vehicle_a.id}/assign/",
                              {"driver_id": self.driver_b.id}, format="json")
        self.assertEqual(r2.status_code, 400)  # driver not in owner's company

    def test_owner_cannot_assign_other_company_vehicle(self):
        r = self._assign(self.owner_a, self.vehicle_b, self.driver_a)
        self.assertEqual(r.status_code, 404)  # vehicle not in owner's company

    def test_reassign_ends_previous_active(self):
        d2 = Driver.objects.create(full_name="Driver A2", mobile="3",
                                   plate_number="", company=self.company_a)
        self._assign(self.owner_a, self.vehicle_a, self.driver_a)
        self._assign(self.owner_a, self.vehicle_a, d2)
        active = DriverVehicleAssignment.objects.filter(vehicle=self.vehicle_a, is_active=True)
        self.assertEqual(active.count(), 1)
        self.assertEqual(active.first().driver_id, d2.id)

    def test_unassign(self):
        self._assign(self.owner_a, self.vehicle_a, self.driver_a)
        self.client.force_authenticate(self.owner_a)
        r = self.client.post(f"/api/accounts/vehicles/{self.vehicle_a.id}/unassign/")
        self.assertEqual(r.status_code, 200)
        self.assertIsNone(r.json()["assigned_driver"])
        self.assertFalse(DriverVehicleAssignment.objects.filter(
            vehicle=self.vehicle_a, is_active=True).exists())

    def test_telemetry_uses_active_assignment_vehicle(self):
        # activate driver_a's login, assign a vehicle, then telemetry mirrors it
        u = User.objects.create_user("mobA", password="pw123456")
        self.driver_a.user = u
        self.driver_a.save()
        self._assign(self.owner_a, self.vehicle_a, self.driver_a)
        self.client.force_authenticate(u)
        r = self.client.post("/api/accounts/locations/", {
            "locations": [{"lat": 52.5, "lng": 13.4, "speed": 10,
                           "recorded_at": "2026-08-11T10:00:00Z"}]
        }, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["vehicle"], "A-1")
        self.vehicle_a.refresh_from_db()
        self.assertAlmostEqual(self.vehicle_a.lat, 52.5, places=3)
