"""Phase 25 — regression coverage for areas not covered by the focused suites:
JWT refresh, expenses, alerts, settings, live-map API, cross-tenant telemetry."""
import uuid
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.cache import cache as django_cache
from rest_framework.test import APITestCase
from rest_framework.throttling import ScopedRateThrottle

from accounts.models import (
    Company, Driver, Vehicle, Membership, DriverVehicleAssignment,
    Expense, CompanySettings, LocationPing,
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


class VehicleMassAssignmentTests(TwoCompanies):
    """Server-owned telemetry must never be settable through the normal
    vehicle CRUD endpoint — only via the dedicated /locations/ ingest path."""

    def test_patch_cannot_change_telemetry_fields(self):
        v = Vehicle.objects.create(company=self.ca, plate_number="A-1", vehicle_type="Van",
                                   lat=10.0, lng=20.0, speed=5, fuel_level=80, odometer=1000)
        self.client.force_authenticate(self.oa)
        r = self.client.patch(f"/api/accounts/vehicles/{v.id}/", {
            "lat": 99.9, "lng": 99.9, "speed": 999,
            "fuel_level": 1, "odometer": 999999,
            "plate_number": "A-1-RENAMED",
        }, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        v.refresh_from_db()
        # Telemetry is untouched...
        self.assertEqual(v.lat, 10.0)
        self.assertEqual(v.lng, 20.0)
        self.assertEqual(v.speed, 5)
        self.assertEqual(v.fuel_level, 80)
        self.assertEqual(v.odometer, 1000)
        # ...but a legitimate, non-telemetry field still updates normally.
        self.assertEqual(v.plate_number, "A-1-RENAMED")

    def test_create_ignores_client_supplied_telemetry(self):
        self.client.force_authenticate(self.oa)
        r = self.client.post("/api/accounts/vehicles/", {
            "plate_number": "NEW-9", "vehicle_type": "Van",
            "lat": 5.0, "lng": 6.0, "speed": 42, "fuel_level": 3,
        }, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        v = Vehicle.objects.get(plate_number="NEW-9")
        self.assertIsNone(v.lat)
        self.assertIsNone(v.lng)
        self.assertEqual(v.speed, 0)
        self.assertEqual(v.fuel_level, 100)  # model default, not the client's "3"


class LoginSecurityTests(TwoCompanies):
    """Both login endpoints must (a) give a generic, non-enumerating error for
    both 'unknown username' and 'wrong password', and (b) share the same
    IP-keyed 'login' throttle scope, so a single IP is capped regardless of
    how many different usernames it tries."""

    def tearDown(self):
        django_cache.clear()

    def test_unified_error_code_for_bad_username_and_bad_password(self):
        for url in ("/api/accounts/auth/login/", "/api/auth/token/login/"):
            r_unknown = self.client.post(url, {"username": "no-such-user", "password": "x"},
                                         format="json")
            r_wrongpw = self.client.post(url, {"username": "oa", "password": "wrong"},
                                        format="json")
            self.assertEqual(r_unknown.status_code, 401)
            self.assertEqual(r_wrongpw.status_code, 401)
            self.assertEqual(r_unknown.json()["code"], "invalid_credentials")
            self.assertEqual(r_wrongpw.json()["code"], "invalid_credentials")
            self.assertEqual(r_unknown.json()["detail"], r_wrongpw.json()["detail"])

    def test_ip_wide_throttle_caps_password_spray_across_usernames_and_endpoints(self):
        # Test settings null out DEFAULT_THROTTLE_RATES so the suite doesn't
        # false-trip; temporarily restore a tiny rate to prove the mechanism.
        with patch.object(ScopedRateThrottle, 'THROTTLE_RATES', {'login': '2/min'}):
            r1 = self.client.post("/api/accounts/auth/login/",
                                  {"username": "attacker1", "password": "x"}, format="json")
            r2 = self.client.post("/api/auth/token/login/",
                                  {"username": "attacker2", "password": "x"}, format="json")
            # Same IP, third DIFFERENT username, third distinct endpoint call
            # -> must be capped even though no username repeats.
            r3 = self.client.post("/api/accounts/auth/login/",
                                  {"username": "attacker3", "password": "x"}, format="json")
        self.assertEqual(r1.status_code, 401)
        self.assertEqual(r2.status_code, 401)
        self.assertEqual(r3.status_code, 429)


class CompanyRegistrationErrorRecoveryTests(APITestCase):
    """If Company creation fails after the User was already created, the view
    must return a clean 400 (with the user cleaned up), not a 500 from
    TransactionManagementError."""

    def test_company_create_failure_yields_400_and_cleans_up_user(self):
        with patch("accounts.serializers.Company.objects.create",
                  side_effect=Exception("boom")):
            r = self.client.post("/api/accounts/register/company/", {
                "user": {"username": "willfail", "email": "willfail@example.com",
                         "password": "pw123456"},
                "company_name": "WillFail Co", "manager_full_name": "M", "phone": "1",
            }, format="json")
        self.assertEqual(r.status_code, 400, r.content)
        self.assertFalse(User.objects.filter(username="willfail").exists())


class TelemetryDedupRaceTests(TwoCompanies):
    """A concurrent retransmit of the same offline fix can pass the
    exists()-check twice; the DB's uniqueness constraint must be handled as a
    graceful duplicate, not surfaced as an unhandled 500."""

    def setUp(self):
        super().setUp()
        self.mob = User.objects.create_user("mobrace", password="pw123456")
        self.driver = Driver.objects.create(user=self.mob, full_name="D", mobile="1",
                                            company=self.ca)
        Membership.objects.create(user=self.mob, company=self.ca, role=Membership.Role.DRIVER)
        self.vehicle = Vehicle.objects.create(company=self.ca, plate_number="RACE-1",
                                              vehicle_type="Van")
        DriverVehicleAssignment.objects.create(company=self.ca, driver=self.driver,
                                               vehicle=self.vehicle, is_active=True)

    def test_concurrent_duplicate_event_id_is_graceful_not_500(self):
        eid = str(uuid.uuid4())
        # Simulate another request having already won the race and inserted
        # this event_id a moment before this request's exists() check ran.
        LocationPing.objects.create(company=self.ca, driver=self.driver,
                                    vehicle=self.vehicle, event_id=eid,
                                    lat=1, lng=2, speed=0,
                                    recorded_at="2026-08-11T10:00:00Z")
        self.client.force_authenticate(self.mob)
        # Force the exists()-check to report "not a duplicate" (as it would
        # under a real race, on a stale read), so the code proceeds to
        # ser.save() and collides with the real DB constraint.
        with patch("accounts.views.LocationPing.objects.filter") as mock_filter:
            mock_filter.return_value.exists.return_value = False
            r = self.client.post("/api/accounts/locations/", {"locations": [
                {"event_id": eid, "lat": 3, "lng": 4, "speed": 1,
                 "recorded_at": "2026-08-11T10:01:00Z"}]}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["saved"], 0)
        self.assertEqual(r.json()["duplicates"], 1)
        self.assertEqual(LocationPing.objects.filter(event_id=eid).count(), 1)
