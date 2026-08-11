"""Phase 18 — subscription limit enforcement + tenant-scoped usage."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import Company, Membership, Plan, Subscription, Driver


class SubscriptionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        # small plan for the test (plans are seeded by migration 0023)
        self.free, _ = Plan.objects.update_or_create(
            code="FREE", defaults={"name": "Free", "max_drivers": 2, "max_vehicles": 2})
        Subscription.objects.update_or_create(
            company=self.company, defaults={"plan": self.free, "status": "TRIAL"})

    def test_driver_limit_enforced(self):
        self.client.force_authenticate(self.owner)
        for i in range(2):
            r = self.client.post("/api/accounts/drivers/",
                                 {"full_name": f"D{i}", "mobile": "1", "plate_number": f"P-{i}"}, format="json")
            self.assertEqual(r.status_code, 201, r.content)
        # third exceeds the FREE limit
        r = self.client.post("/api/accounts/drivers/",
                             {"full_name": "D3", "mobile": "1", "plate_number": "P-3"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Driver.objects.filter(company=self.company).count(), 2)

    def test_subscription_usage_endpoint(self):
        self.client.force_authenticate(self.owner)
        r = self.client.get("/api/accounts/subscription/")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["plan"]["code"], "FREE")
        self.assertEqual(body["usage"]["drivers"], 0)
        self.assertIn("plans", body)

    def test_plan_change(self):
        Plan.objects.get_or_create(code="PRO", defaults={"name": "Pro", "max_drivers": 50, "max_vehicles": 50})
        self.client.force_authenticate(self.owner)
        r = self.client.post("/api/accounts/subscription/", {"plan": "PRO"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["plan"]["code"], "PRO")
