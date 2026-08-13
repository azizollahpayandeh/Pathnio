"""
Regression tests for two production bugs:

1. Expenses could not be created — the dashboard sent `date` as a full ISO
   datetime and the DateField rejected it ("Date has wrong format").
2. "Mark as read" duplicated notifications — de-duplication keyed on
   acknowledged_at, so acknowledging an alert for a still-true condition made
   the next refresh recreate it.
"""
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import Company, Vehicle, Membership, FleetAlert, Expense
from accounts.alerts_engine import refresh_fleet_alerts


class ExpenseCreateTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("exp_owner", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="ExpCo", manager_full_name="O", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.client.force_authenticate(self.owner)

    def test_create_expense_with_iso_datetime_date(self):
        """The exact payload the dashboard used to send must now succeed."""
        r = self.client.post("/api/accounts/expenses/", {
            "title": "Fuel", "category": "Fuel", "amount": 42.5,
            "date": "2026-08-12T00:00:00.000Z",
            "plate_number": "", "driver": "", "status": "Paid", "description": "",
        }, format="json")
        self.assertIn(r.status_code, (200, 201), r.content)
        e = Expense.objects.get(title="Fuel")
        self.assertEqual(str(e.date), "2026-08-12")
        self.assertEqual(e.company_id, self.company.id)  # scoped server-side

    def test_create_expense_with_plain_date(self):
        r = self.client.post("/api/accounts/expenses/", {
            "title": "Tolls", "category": "Tolls", "amount": 8,
            "date": "2026-08-12", "status": "Paid",
        }, format="json")
        self.assertIn(r.status_code, (200, 201), r.content)

    def test_expense_amount_is_persisted(self):
        self.client.post("/api/accounts/expenses/", {
            "title": "Repair", "category": "Repair", "amount": 199.99,
            "date": "2026-08-12T10:30:00.000Z", "status": "Pending",
        }, format="json")
        e = Expense.objects.get(title="Repair")
        self.assertEqual(str(e.amount), "199.99")
        self.assertEqual(e.status, "Pending")


class AlertDeduplicationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("al_owner", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="AlCo", manager_full_name="O", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        # A vehicle in maintenance = a real, persistent alert condition.
        self.vehicle = Vehicle.objects.create(
            company=self.company, plate_number="AL-1", vehicle_type="Van",
            status="Maintenance")
        self.client.force_authenticate(self.owner)

    def _count(self):
        return FleetAlert.objects.filter(company=self.company).count()

    def test_repeated_refresh_does_not_duplicate(self):
        refresh_fleet_alerts(self.company)
        refresh_fleet_alerts(self.company)
        refresh_fleet_alerts(self.company)
        self.assertEqual(self._count(), 1)

    def test_acknowledged_alert_is_not_recreated(self):
        """THE BUG: marking as read used to spawn a duplicate on next refresh."""
        refresh_fleet_alerts(self.company)
        alert = FleetAlert.objects.get(company=self.company)
        r = self.client.post(f"/api/accounts/fleet-alerts/{alert.id}/acknowledge/")
        self.assertEqual(r.status_code, 200)

        refresh_fleet_alerts(self.company)
        refresh_fleet_alerts(self.company)
        self.assertEqual(self._count(), 1, "acknowledging must not recreate the alert")
        alert.refresh_from_db()
        self.assertIsNotNone(alert.acknowledged_at)  # stays read
        self.assertIsNone(alert.resolved_at)         # condition still true

    def test_listing_does_not_duplicate_after_read(self):
        """The list endpoint refreshes alerts; that must stay idempotent."""
        self.client.get("/api/accounts/fleet-alerts/")
        alert = FleetAlert.objects.get(company=self.company)
        self.client.post(f"/api/accounts/fleet-alerts/{alert.id}/acknowledge/")
        for _ in range(3):
            self.client.get("/api/accounts/fleet-alerts/")
        self.assertEqual(self._count(), 1)

    def test_condition_clearing_resolves_and_can_reopen(self):
        refresh_fleet_alerts(self.company)
        alert = FleetAlert.objects.get(company=self.company)
        # condition clears
        self.vehicle.status = "Active"
        self.vehicle.save(update_fields=["status"])
        refresh_fleet_alerts(self.company)
        alert.refresh_from_db()
        self.assertIsNotNone(alert.resolved_at)
        # genuine re-occurrence raises a NEW alert
        self.vehicle.status = "Maintenance"
        self.vehicle.save(update_fields=["status"])
        refresh_fleet_alerts(self.company)
        self.assertEqual(self._count(), 2)

    def test_acknowledge_all_and_dismiss(self):
        refresh_fleet_alerts(self.company)
        r = self.client.post("/api/accounts/fleet-alerts/acknowledge-all/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["acknowledged"], 1)
        alert = FleetAlert.objects.get(company=self.company)
        d = self.client.delete(f"/api/accounts/fleet-alerts/{alert.id}/")
        self.assertEqual(d.status_code, 204)
        self.assertEqual(self._count(), 0)
