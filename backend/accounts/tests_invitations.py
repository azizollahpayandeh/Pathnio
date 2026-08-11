"""
Phase 3 — secure driver invitation + mobile activation tests (spec §10).

Covers owner-side invitation authorization, activation validity/expiry/revocation,
single-use guarantees, and the critical rule that the mobile client can never
choose its company/driver by manipulating the request.
"""
from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import Company, Driver, Membership, DriverInvitation
from accounts.invitations import issue_invitation

ACTIVATE = "/api/accounts/driver-invitations/activate/"


class InvitationTests(APITestCase):
    def setUp(self):
        self.owner_a = User.objects.create_user("ownerA", password="pw123456")
        self.company_a = Company.objects.create(
            user=self.owner_a, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner_a, company=self.company_a,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_a = Driver.objects.create(
            full_name="Driver A", mobile="1", plate_number="A-1", company=self.company_a)

        self.owner_b = User.objects.create_user("ownerB", password="pw123456")
        self.company_b = Company.objects.create(
            user=self.owner_b, company_name="Beta", manager_full_name="B", phone="2")
        Membership.objects.create(user=self.owner_b, company=self.company_b,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver_b = Driver.objects.create(
            full_name="Driver B", mobile="2", plate_number="B-1", company=self.company_b)

        # bare mobile user (registered but not yet linked to any driver)
        self.mob = User.objects.create_user("mobuser", password="pw123456")

    def _issue(self, driver=None, **overrides):
        driver = driver or self.driver_a
        inv, raw = issue_invitation(driver, driver.company, self.owner_a)
        if overrides:
            for k, v in overrides.items():
                setattr(inv, k, v)
            inv.save()
        return inv, raw

    # 1
    def test_owner_can_create_invitation(self):
        self.client.force_authenticate(self.owner_a)
        r = self.client.post(f"/api/accounts/drivers/{self.driver_a.id}/invitation/")
        self.assertEqual(r.status_code, 201)
        self.assertGreater(len(r.json().get("token", "")), 16)

    # 2
    def test_owner_cannot_invite_other_company_driver(self):
        self.client.force_authenticate(self.owner_a)
        r = self.client.post(f"/api/accounts/drivers/{self.driver_b.id}/invitation/")
        self.assertEqual(r.status_code, 404)

    # 3
    def test_unauth_cannot_create_invitation(self):
        r = self.client.post(f"/api/accounts/drivers/{self.driver_a.id}/invitation/")
        self.assertIn(r.status_code, (401, 403))

    # 4
    def test_driver_can_activate_valid_invitation(self):
        _, raw = self._issue()
        self.client.force_authenticate(self.mob)
        r = self.client.post(ACTIVATE, {"token": raw}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["activated"])
        self.driver_a.refresh_from_db()
        self.assertEqual(self.driver_a.user_id, self.mob.id)
        self.assertTrue(Membership.objects.filter(
            user=self.mob, company=self.company_a, role="DRIVER").exists())

    # 5 / 11
    def test_invitation_single_use(self):
        _, raw = self._issue()
        self.client.force_authenticate(self.mob)
        r1 = self.client.post(ACTIVATE, {"token": raw}, format="json")
        self.assertEqual(r1.status_code, 200)
        u2 = User.objects.create_user("u2", password="pw123456")
        self.client.force_authenticate(u2)
        r2 = self.client.post(ACTIVATE, {"token": raw}, format="json")
        self.assertEqual(r2.status_code, 400)
        self.assertEqual(DriverInvitation.objects.filter(
            status=DriverInvitation.Status.USED).count(), 1)

    # 6
    def test_expired_invitation_rejected(self):
        _, raw = self._issue(expires_at=timezone.now() - timedelta(minutes=1))
        self.client.force_authenticate(self.mob)
        r = self.client.post(ACTIVATE, {"token": raw}, format="json")
        self.assertEqual(r.status_code, 400)

    # 7
    def test_revoked_invitation_rejected(self):
        _, raw = self._issue()
        self.client.force_authenticate(self.owner_a)
        self.client.post(f"/api/accounts/drivers/{self.driver_a.id}/invitation/revoke/")
        self.client.force_authenticate(self.mob)
        r = self.client.post(ACTIVATE, {"token": raw}, format="json")
        self.assertEqual(r.status_code, 400)

    # 8
    def test_invalid_token_rejected(self):
        self.client.force_authenticate(self.mob)
        r = self.client.post(ACTIVATE, {"token": "totally-made-up-code"}, format="json")
        self.assertEqual(r.status_code, 400)

    # 9 / 10 — client-supplied company_id/driver_id are ignored
    def test_activation_ignores_client_tenant_fields(self):
        _, raw = self._issue()  # invitation is for driver_a / company_a
        self.client.force_authenticate(self.mob)
        r = self.client.post(ACTIVATE, {
            "token": raw,
            "company_id": self.company_b.id,
            "driver_id": self.driver_b.id,
            "company": self.company_b.id,
        }, format="json")
        self.assertEqual(r.status_code, 200)
        self.driver_a.refresh_from_db()
        self.assertEqual(self.driver_a.user_id, self.mob.id)     # bound to A
        self.driver_b.refresh_from_db()
        self.assertIsNone(self.driver_b.user_id)                 # NOT B
        self.assertEqual(Membership.objects.get(user=self.mob).company_id, self.company_a.id)

    # (already-linked user cannot re-activate elsewhere)
    def test_linked_user_cannot_reactivate(self):
        _, raw_a = self._issue()
        self.client.force_authenticate(self.mob)
        self.client.post(ACTIVATE, {"token": raw_a}, format="json")
        _, raw_b = self._issue(driver=self.driver_b)
        r = self.client.post(ACTIVATE, {"token": raw_b}, format="json")
        self.assertEqual(r.status_code, 409)

    # 12
    def test_dashboard_jwt_still_works(self):
        r = self.client.post("/api/token/",
                             {"username": "ownerA", "password": "pw123456"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.json())

    # 13
    def test_telemetry_works_after_activation(self):
        _, raw = self._issue()
        self.client.force_authenticate(self.mob)
        self.client.post(ACTIVATE, {"token": raw}, format="json")
        r = self.client.post("/api/accounts/locations/", {
            "locations": [{"lat": 52.5, "lng": 13.4, "speed": 3,
                           "recorded_at": "2026-08-11T10:00:00Z"}]
        }, format="json")
        self.assertEqual(r.status_code, 201)

    # mobile bare-registration issues a working token but no driver context
    def test_mobile_register_creates_unlinked_account(self):
        r = self.client.post("/api/accounts/driver/register/",
                             {"username": "newmob", "email": "n@m.com", "password": "pw123456"},
                             format="json")
        self.assertEqual(r.status_code, 201)
        body = r.json()
        self.assertIn("access", body)
        self.assertFalse(body["activated"])
