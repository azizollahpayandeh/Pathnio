"""
Driver-side operations: trip control, inspections, incidents, expenses.

The theme of these tests is that the SERVER decides company/vehicle/driver —
a driver must never be able to write into another company's data or against a
vehicle they are not assigned to, however the request is crafted.
"""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Membership, DriverVehicleAssignment, Trip,
    VehicleInspection, Incident, Expense, FleetAlert,
)


class DriverOpsBase(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("own", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Co", manager_full_name="O", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.duser = User.objects.create_user("drv", password="pw123456")
        self.driver = Driver.objects.create(
            user=self.duser, full_name="D One", mobile="1", company=self.company)
        Membership.objects.create(user=self.duser, company=self.company,
                                  role=Membership.Role.DRIVER)
        self.vehicle = Vehicle.objects.create(
            company=self.company, plate_number="V-1", vehicle_type="Van", odometer=1000)
        DriverVehicleAssignment.objects.create(
            company=self.company, driver=self.driver, vehicle=self.vehicle, is_active=True)
        self.trip = Trip.objects.create(
            company=self.company, origin="A", destination="B",
            driver_ref=self.driver, vehicle_ref=self.vehicle, status="PLANNED")

        # A completely separate company, to prove isolation.
        self.other_owner = User.objects.create_user("own2", password="pw123456")
        self.other_company = Company.objects.create(
            user=self.other_owner, company_name="Other", manager_full_name="X", phone="2")
        self.other_driver = Driver.objects.create(
            full_name="Foreign", mobile="9", company=self.other_company)
        self.other_trip = Trip.objects.create(
            company=self.other_company, origin="X", destination="Y",
            driver_ref=self.other_driver, status="PLANNED")


class TripControlTests(DriverOpsBase):
    def test_driver_starts_and_completes_with_odometer(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/start/",
                             {"odometer": 1200}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "ACTIVE")

        r = self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/complete/",
                             {"odometer": 1350}, format="json")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["status"], "COMPLETED")
        # Distance comes from the vehicle, not from an office estimate.
        self.assertEqual(body["distance"], 150)

        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.odometer, 1350)

    def test_end_odometer_cannot_be_lower_than_start(self):
        self.client.force_authenticate(self.duser)
        self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/start/",
                         {"odometer": 1200}, format="json")
        r = self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/complete/",
                             {"odometer": 900}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_cannot_complete_a_trip_that_never_started(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/complete/",
                             {}, format="json")
        self.assertEqual(r.status_code, 409)

    def test_double_start_is_rejected(self):
        self.client.force_authenticate(self.duser)
        self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/start/", {}, format="json")
        r = self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/start/", {}, format="json")
        self.assertEqual(r.status_code, 409)

    def test_driver_cannot_touch_another_companys_trip(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post(f"/api/accounts/driver/trips/{self.other_trip.id}/start/",
                             {}, format="json")
        self.assertEqual(r.status_code, 404)
        self.other_trip.refresh_from_db()
        self.assertEqual(self.other_trip.status, "PLANNED")

    def test_non_driver_account_is_refused(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(f"/api/accounts/driver/trips/{self.trip.id}/start/",
                             {}, format="json")
        self.assertEqual(r.status_code, 403)


class InspectionTests(DriverOpsBase):
    def test_clean_inspection_records_no_defect(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/inspections/", {
            "kind": "PRE", "odometer": 1100,
            "items": [{"key": "brakes", "ok": True}, {"key": "tyres", "ok": True}],
        }, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertFalse(r.json()["has_defects"])
        self.assertEqual(FleetAlert.objects.filter(alert_type="INSPECTION_DEFECT").count(), 0)

    def test_failed_item_raises_a_fleet_alert(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/inspections/", {
            "kind": "PRE",
            "items": [{"key": "brakes", "ok": False, "note": "soft pedal"}],
            "defect_notes": "needs a look",
        }, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertTrue(r.json()["has_defects"])
        self.assertEqual(r.json()["failed_items"], ["brakes"])
        alert = FleetAlert.objects.get(alert_type="INSPECTION_DEFECT")
        self.assertEqual(alert.company_id, self.company.id)
        self.assertEqual(alert.vehicle_id, self.vehicle.id)

    def test_unknown_checklist_items_are_ignored(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/inspections/", {
            "kind": "PRE",
            "items": [{"key": "not_a_real_item", "ok": False}, {"key": "lights", "ok": True}],
        }, format="json")
        self.assertEqual(r.status_code, 201)
        insp = VehicleInspection.objects.get(id=r.json()["id"])
        self.assertEqual([i["key"] for i in insp.items], ["lights"])
        self.assertFalse(insp.has_defects)   # the bogus failure did not count

    def test_inspection_binds_to_the_assigned_vehicle_only(self):
        foreign = Vehicle.objects.create(
            company=self.other_company, plate_number="X-9", vehicle_type="Truck")
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/inspections/", {
            "kind": "PRE", "items": [{"key": "tyres", "ok": True}],
            "vehicle": foreign.id, "company": self.other_company.id,   # ignored
        }, format="json")
        self.assertEqual(r.status_code, 201)
        insp = VehicleInspection.objects.get(id=r.json()["id"])
        self.assertEqual(insp.vehicle_id, self.vehicle.id)
        self.assertEqual(insp.company_id, self.company.id)

    def test_driver_without_a_vehicle_cannot_inspect(self):
        DriverVehicleAssignment.objects.update(is_active=False)
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/inspections/", {
            "kind": "PRE", "items": []}, format="json")
        self.assertEqual(r.status_code, 409)

    def test_owner_sees_only_own_company_inspections(self):
        self.client.force_authenticate(self.duser)
        self.client.post("/api/accounts/driver/inspections/", {
            "kind": "PRE", "items": [{"key": "tyres", "ok": True}]}, format="json")
        VehicleInspection.objects.create(
            company=self.other_company,
            vehicle=Vehicle.objects.create(company=self.other_company, plate_number="Z-1"),
            kind="PRE")
        self.client.force_authenticate(self.owner)
        rows = self.client.get("/api/accounts/inspections/").json()
        rows = rows["results"] if isinstance(rows, dict) else rows
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["plate_number"], "V-1")


class IncidentTests(DriverOpsBase):
    def test_report_creates_incident_and_alert(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/incidents/", {
            "kind": "BREAKDOWN", "severity": "HIGH",
            "description": "Engine overheating on the A9.",
            "lat": 52.5, "lng": 13.4,
        }, format="json")
        self.assertEqual(r.status_code, 201)
        inc = Incident.objects.get(id=r.json()["id"])
        self.assertEqual(inc.company_id, self.company.id)
        self.assertEqual(inc.vehicle_id, self.vehicle.id)
        self.assertTrue(FleetAlert.objects.filter(alert_type="INCIDENT").exists())

    def test_owner_can_resolve(self):
        self.client.force_authenticate(self.duser)
        rid = self.client.post("/api/accounts/driver/incidents/", {
            "kind": "DELAY", "description": "Traffic"}, format="json").json()["id"]
        self.client.force_authenticate(self.owner)
        r = self.client.post(f"/api/accounts/incidents/{rid}/resolve/")
        self.assertEqual(r.status_code, 200)
        self.assertIsNotNone(Incident.objects.get(id=rid).resolved_at)


class DriverExpenseTests(DriverOpsBase):
    def test_driver_expense_arrives_pending_for_review(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/expenses/", {
            "category": "Fuel", "amount": "82.50", "liters": "45.2", "odometer": 1500,
        }, format="json")
        self.assertEqual(r.status_code, 201)
        e = Expense.objects.get(id=r.json()["id"])
        self.assertEqual(e.company_id, self.company.id)
        self.assertEqual(e.source, "DRIVER")
        self.assertEqual(e.approval, "PENDING")
        self.assertEqual(e.submitted_by_id, self.duser.id)
        self.assertEqual(e.plate_number, "V-1")
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.odometer, 1500)

    def test_zero_amount_rejected(self):
        self.client.force_authenticate(self.duser)
        r = self.client.post("/api/accounts/driver/expenses/", {
            "category": "Fuel", "amount": "0"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_dashboard_expenses_stay_approved(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post("/api/accounts/expenses/", {
            "title": "Office fuel", "category": "Fuel", "amount": "20.00",
            "date": "2026-08-16"}, format="json")
        self.assertIn(r.status_code, (200, 201))
        self.assertEqual(Expense.objects.get(id=r.json()["id"]).approval, "APPROVED")


class ExpenseApprovalTests(DriverOpsBase):
    def _submit(self):
        self.client.force_authenticate(self.duser)
        return self.client.post("/api/accounts/driver/expenses/", {
            "category": "Fuel", "amount": "50.00"}, format="json").json()["id"]

    def test_owner_approves_driver_expense(self):
        eid = self._submit()
        self.client.force_authenticate(self.owner)
        r = self.client.post(f"/api/accounts/expenses/{eid}/approve/")
        self.assertEqual(r.status_code, 200)
        e = Expense.objects.get(id=eid)
        self.assertEqual(e.approval, "APPROVED")
        self.assertEqual(e.status, "Paid")

    def test_owner_rejects_driver_expense(self):
        eid = self._submit()
        self.client.force_authenticate(self.owner)
        self.client.post(f"/api/accounts/expenses/{eid}/reject/")
        self.assertEqual(Expense.objects.get(id=eid).approval, "REJECTED")

    def test_pending_filter_lists_only_unreviewed(self):
        self._submit()
        self.client.force_authenticate(self.owner)
        rows = self.client.get("/api/accounts/expenses/?pending=1").json()
        rows = rows["results"] if isinstance(rows, dict) else rows
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["approval"], "PENDING")

    def test_client_cannot_self_approve_through_the_serializer(self):
        eid = self._submit()
        self.client.force_authenticate(self.owner)
        self.client.patch(f"/api/accounts/expenses/{eid}/",
                          {"approval": "APPROVED"}, format="json")
        self.assertEqual(Expense.objects.get(id=eid).approval, "PENDING")
