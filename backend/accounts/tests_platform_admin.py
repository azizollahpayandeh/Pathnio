"""
Platform-admin API: cross-company oversight, gated by is_staff.

The overriding rule tested here: a normal company OWNER must never reach any
of these endpoints (they would otherwise see every tenant's data), and an admin
cannot lock itself out.
"""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Membership, Plan, Subscription, ContactMessage,
)


class PlatformAdminBase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user("root", password="pw123456", is_staff=True)

        self.owner = User.objects.create_user("own", password="pw123456", email="own@co.test")
        self.company = Company.objects.create(
            user=self.owner, company_name="Alpha Co", manager_full_name="Al", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.duser = User.objects.create_user("drv", password="pw123456")
        self.driver = Driver.objects.create(
            user=self.duser, full_name="D", mobile="1", company=self.company)
        Vehicle.objects.create(company=self.company, plate_number="A-1", vehicle_type="Van")

        plan, _ = Plan.objects.update_or_create(
            code="PRO",
            defaults=dict(name="Professional", max_drivers=50, max_vehicles=50,
                          price_monthly=49))
        Subscription.objects.create(company=self.company, plan=plan,
                                    status=Subscription.Status.ACTIVE)
        ContactMessage.objects.create(name="Visitor", email="v@x.test",
                                      subject="Hi", message="Question", status="open")


class OverviewTests(PlatformAdminBase):
    def test_overview_aggregates(self):
        self.client.force_authenticate(self.admin)
        r = self.client.get("/api/accounts/admin/overview/")
        self.assertEqual(r.status_code, 200)
        d = r.json()
        self.assertEqual(d["companies"], 1)
        self.assertEqual(d["drivers"], 1)
        self.assertEqual(d["vehicles"], 1)
        self.assertEqual(d["mrr"], "49.00")
        self.assertEqual(d["subscriptions"]["active"], 1)
        self.assertEqual(d["open_messages"], 1)
        self.assertTrue(any(p["code"] == "PRO" for p in d["plan_distribution"]))

    def test_owner_is_forbidden(self):
        self.client.force_authenticate(self.owner)
        for path in ("overview/", "companies/", "contact-messages/"):
            r = self.client.get(f"/api/accounts/admin/{path}")
            self.assertEqual(r.status_code, 403, path)

    def test_anonymous_is_unauthorized(self):
        self.assertEqual(self.client.get("/api/accounts/admin/overview/").status_code, 401)


class CompanyListTests(PlatformAdminBase):
    def test_lists_companies_with_counts(self):
        self.client.force_authenticate(self.admin)
        rows = self.client.get("/api/accounts/admin/companies/").json()
        self.assertEqual(len(rows), 1)
        c = rows[0]
        self.assertEqual(c["company_name"], "Alpha Co")
        self.assertEqual(c["driver_count"], 1)
        self.assertEqual(c["vehicle_count"], 1)
        self.assertEqual(c["plan"], "PRO")
        self.assertTrue(c["is_active"])


class CompanyActionTests(PlatformAdminBase):
    def test_suspend_and_reactivate_freezes_all_company_logins(self):
        self.client.force_authenticate(self.admin)
        r = self.client.post(f"/api/accounts/admin/companies/{self.company.id}/suspend/")
        self.assertEqual(r.status_code, 200)
        self.owner.refresh_from_db(); self.duser.refresh_from_db()
        self.assertFalse(self.owner.is_active)   # owner frozen
        self.assertFalse(self.duser.is_active)   # driver frozen too

        self.client.post(f"/api/accounts/admin/companies/{self.company.id}/activate/")
        self.owner.refresh_from_db(); self.duser.refresh_from_db()
        self.assertTrue(self.owner.is_active)
        self.assertTrue(self.duser.is_active)

    def test_admin_cannot_suspend_their_own_company(self):
        # give the admin a company of their own
        c = Company.objects.create(user=self.admin, company_name="Root Co",
                                   manager_full_name="R", phone="9")
        self.client.force_authenticate(self.admin)
        r = self.client.post(f"/api/accounts/admin/companies/{c.id}/suspend/")
        self.assertEqual(r.status_code, 400)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)

    def test_owner_cannot_suspend_anyone(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(f"/api/accounts/admin/companies/{self.company.id}/suspend/")
        self.assertEqual(r.status_code, 403)


class MessagesTests(PlatformAdminBase):
    def test_admin_sees_contact_messages(self):
        self.client.force_authenticate(self.admin)
        rows = self.client.get("/api/accounts/admin/contact-messages/").json()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["subject"], "Hi")
        self.assertEqual(rows[0]["status"], "open")


class PublicContactTests(PlatformAdminBase):
    def test_public_contact_saves_name_and_email_and_reaches_admin(self):
        # anonymous visitor submits the public contact form
        r = self.client.post("/api/accounts/contact/", {
            "name": "Jane Visitor",
            "email": "jane@outside.test",
            "subject": "Pricing question",
            "message": "How much for 20 vehicles?",
        }, format="json")
        self.assertEqual(r.status_code, 201)

        # it is saved WITH the visitor's name/email (the old read-only
        # serializer dropped these, so admins saw blank senders)
        from accounts.models import ContactMessage
        msg = ContactMessage.objects.get(email="jane@outside.test")
        self.assertEqual(msg.name, "Jane Visitor")
        self.assertEqual(msg.subject, "Pricing question")
        self.assertEqual(msg.status, "open")

        # and it shows up in the admin messages inbox
        self.client.force_authenticate(self.admin)
        rows = self.client.get("/api/accounts/admin/contact-messages/").json()
        hit = [m for m in rows if m["email"] == "jane@outside.test"]
        self.assertEqual(len(hit), 1)
        self.assertEqual(hit[0]["name"], "Jane Visitor")

    def test_public_contact_requires_the_core_fields(self):
        r = self.client.post("/api/accounts/contact/", {"message": "hi"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_public_contact_cannot_spoof_status_or_reply(self):
        r = self.client.post("/api/accounts/contact/", {
            "name": "X", "email": "x@y.test", "subject": "s", "message": "m",
            "status": "closed", "reply": "faked",
        }, format="json")
        self.assertEqual(r.status_code, 201)
        from accounts.models import ContactMessage
        msg = ContactMessage.objects.get(email="x@y.test")
        self.assertEqual(msg.status, "open")   # status not client-writable
        self.assertFalse(msg.reply)            # reply not client-writable
