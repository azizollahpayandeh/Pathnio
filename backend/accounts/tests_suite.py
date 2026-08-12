"""Phase 25 — regression coverage for areas not covered by the focused suites:
JWT refresh, expenses, alerts, settings, live-map API, cross-tenant telemetry."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Membership, DriverVehicleAssignment,
    Expense, CompanySettings,
)


class TwoCompanies(APITestCase):
    def setUp(self):
        self.oa = User.objects.create_user("oa", password="pw123456")
        self.ca = Company.objects.create(user=self.oa, company_name="A", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.oa, company=self.ca, role=Membership.Role.COMPANY_OWNER)
        self.ob = User.objects.create_user("ob", password="pw123456")
        self.cb = Company.objects.create(user=self.ob, company_name="B", manager_full_name="B", phone="2")
        Membership.objects.create(user=self.ob, company=self.cb, role=Membership.Role.COMPANY_OWNER)


class AuthTests(TwoCompanies):
    def test_jwt_refresh(self):
        r = self.client.post("/api/token/", {"username": "oa", "password": "pw123456"}, format="json")
        refresh = r.json()["refresh"]
        rr = self.client.post("/api/auth/token/refresh/", {"refresh": refresh}, format="json")
        self.assertEqual(rr.status_code, 200)
        self.assertIn("access", rr.json())

    def test_bad_login_rejected(self):
        r = self.client.post("/api/token/", {"username": "oa", "password": "wrong"}, format="json")
        self.assertEqual(r.status_code, 401)


class ExpenseTests(TwoCompanies):
    def test_expense_company_scoped(self):
        Expense.objects.create(company=self.ca, title="fuel A", amount=10)
        Expense.objects.create(company=self.cb, title="fuel B", amount=20)
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/expenses/")
        rows = r.json().get("results", r.json())
        self.assertEqual([e["title"] for e in rows], ["fuel A"])

    def test_expense_create_scoped(self):
        self.client.force_authenticate(self.oa)
        r = self.client.post("/api/accounts/expenses/",
                             {"title": "toll", "category": "Tolls", "amount": 5}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Expense.objects.get(title="toll").company_id, self.ca.id)


class AlertTests(TwoCompanies):
    def test_alerts_generated_and_scoped(self):
        # a maintenance vehicle in A produces a real alert; B sees nothing.
        Vehicle.objects.create(company=self.ca, plate_number="A-1", vehicle_type="Van", status="Maintenance")
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/fleet-alerts/")
        rows = r.json().get("results", r.json())
        self.assertTrue(any(a["alert_type"] == "MAINTENANCE_DUE" for a in rows))
        self.client.force_authenticate(self.ob)
        r2 = self.client.get("/api/accounts/fleet-alerts/")
        rows2 = r2.json().get("results", r2.json())
        self.assertEqual(len(rows2), 0)


class SettingsTests(TwoCompanies):
    def test_settings_owner_scoped(self):
        self.client.force_authenticate(self.oa)
        r = self.client.patch("/api/accounts/company/settings/",
                             {"moving_speed_kmh": 8}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(CompanySettings.objects.get(company=self.ca).moving_speed_kmh, 8)
        # company B's settings are untouched / separate
        self.client.force_authenticate(self.ob)
        rb = self.client.get("/api/accounts/company/settings/")
        self.assertNotEqual(rb.json()["moving_speed_kmh"], 8)


class LiveMapTests(TwoCompanies):
    def test_live_feed_scoped(self):
        Vehicle.objects.create(company=self.ca, plate_number="A-1", vehicle_type="Van")
        Vehicle.objects.create(company=self.cb, plate_number="B-1", vehicle_type="Truck")
        self.client.force_authenticate(self.oa)
        r = self.client.get("/api/accounts/vehicles/live/")
        self.assertEqual([v["plate_number"] for v in r.json()], ["A-1"])
        self.assertIn("live_status", r.json()[0])


class CrossTenantTelemetryTests(TwoCompanies):
    def test_driver_cannot_feed_other_company_vehicle(self):
        # driver in A, assigned to A's vehicle; telemetry only ever hits A's vehicle
        mob = User.objects.create_user("mob", password="pw123456")
        da = Driver.objects.create(user=mob, full_name="DA", mobile="1", company=self.ca)
        Membership.objects.create(user=mob, company=self.ca, role=Membership.Role.DRIVER)
        va = Vehicle.objects.create(company=self.ca, plate_number="A-1", vehicle_type="Van")
        vb = Vehicle.objects.create(company=self.cb, plate_number="B-1", vehicle_type="Truck")
        DriverVehicleAssignment.objects.create(company=self.ca, driver=da, vehicle=va, is_active=True)
        self.client.force_authenticate(mob)
        # even if the client sends B's plate, the server uses the active assignment (A)
        r = self.client.post("/api/accounts/locations/", {
            "plate_number": "B-1",
            "locations": [{"lat": 1, "lng": 2, "speed": 5, "recorded_at": "2026-08-11T10:00:00Z"}],
        }, format="json")
        self.assertEqual(r.json()["vehicle"], "A-1")
        vb.refresh_from_db()
        # B untouched: a vehicle with no telemetry has NO position at all
        # (never a 0,0 placeholder).
        self.assertIsNone(vb.lat)
        self.assertIsNone(vb.lng)
        self.assertIsNone(vb.last_seen_at)
