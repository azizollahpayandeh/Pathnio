"""Phase 16 — platform-admin vs company-owner privilege separation."""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import Company, Membership


class AdminSeparationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Alpha", manager_full_name="A", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.admin = User.objects.create_user("admin", password="pw123456", is_staff=True)

    def test_company_owner_denied_platform_user_list(self):
        self.client.force_authenticate(self.owner)
        r = self.client.get("/api/accounts/users/all/")
        self.assertEqual(r.status_code, 403)

    def test_company_owner_denied_platform_admin_alerts(self):
        self.client.force_authenticate(self.owner)
        r = self.client.get("/api/accounts/admin/alerts/")
        self.assertEqual(r.status_code, 403)

    def test_platform_admin_allowed_user_list(self):
        self.client.force_authenticate(self.admin)
        r = self.client.get("/api/accounts/users/all/")
        self.assertEqual(r.status_code, 200)
