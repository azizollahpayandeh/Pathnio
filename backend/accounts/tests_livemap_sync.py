"""
Regression tests for the telemetry / Live Map synchronization bug.

Bug (production, driver `arsalan2`):
  * driver had NO DriverVehicleAssignment, and Driver.plate_number pointed at a
    plate that did not exist -> every ping was stored with vehicle=None
  * the vehicle therefore never got last_seen_at -> driver reported OFFLINE
    although the phone was actively sending real GPS
  * the vehicle kept its default lat/lng = 0,0 -> a marker in the ocean
"""
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import (
    Company, Driver, Vehicle, Membership, DriverVehicleAssignment,
)
from accounts.fleet_status import has_valid_position, driver_status


class TelemetryLiveMapSyncTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("own", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Co", manager_full_name="O", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.duser = User.objects.create_user("drv", password="pw123456")
        self.driver = Driver.objects.create(
            user=self.duser, full_name="D", mobile="1",
            plate_number="STALE-PLATE",  # deliberately wrong, as in production
            company=self.company)
        Membership.objects.create(user=self.duser, company=self.company,
                                  role=Membership.Role.DRIVER)
        self.vehicle = Vehicle.objects.create(
            company=self.company, plate_number="REAL-1", vehicle_type="Van")

    def _ping(self, lat=36.3877306, lng=59.5320141, speed=3.0):
        return self.client.post("/api/accounts/locations/", {
            "locations": [{"lat": lat, "lng": lng, "speed": speed,
                           "recorded_at": timezone.now().isoformat()}],
        }, format="json")

    # 1) A brand-new vehicle has NO position (never 0,0).
    def test_new_vehicle_has_no_position(self):
        self.assertIsNone(self.vehicle.lat)
        self.assertIsNone(self.vehicle.lng)
        self.assertFalse(has_valid_position(self.vehicle))

    # 2) Telemetry from an UNASSIGNED driver must not attach to any vehicle,
    #    but must still mark the driver as present (the core bug).
    def test_unassigned_driver_telemetry_marks_driver_online_only(self):
        self.client.force_authenticate(self.duser)
        r = self._ping()
        self.assertEqual(r.status_code, 201)
        self.assertIsNone(r.json()["vehicle"])
        self.assertFalse(r.json()["vehicle_assigned"])

        self.driver.refresh_from_db()
        self.vehicle.refresh_from_db()
        self.assertIsNotNone(self.driver.last_seen_at)          # driver is seen
        self.assertIsNone(self.vehicle.lat)                     # vehicle untouched
        # ...and the driver is NOT reported offline anymore.
        self.assertEqual(driver_status(self.driver, False, self.vehicle), "AVAILABLE")

    # 3) With a real active assignment the position lands on the right vehicle.
    def test_assigned_driver_telemetry_updates_assigned_vehicle(self):
        DriverVehicleAssignment.objects.create(
            company=self.company, driver=self.driver, vehicle=self.vehicle,
            is_active=True)
        self.client.force_authenticate(self.duser)
        r = self._ping()
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["vehicle"], "REAL-1")
        self.assertTrue(r.json()["vehicle_assigned"])

        self.vehicle.refresh_from_db()
        self.assertAlmostEqual(self.vehicle.lat, 36.3877306, places=5)
        self.assertIsNotNone(self.vehicle.last_seen_at)
        self.assertTrue(has_valid_position(self.vehicle))

    # 4) A stale Driver.plate_number must NEVER be used to guess a vehicle.
    def test_stale_plate_never_binds_a_vehicle(self):
        Vehicle.objects.create(company=self.company, plate_number="STALE-PLATE",
                               vehicle_type="Truck")
        self.client.force_authenticate(self.duser)
        r = self._ping()
        self.assertIsNone(r.json()["vehicle"])  # no assignment => no vehicle
        self.assertFalse(
            Vehicle.objects.get(plate_number="STALE-PLATE").last_seen_at
        )

    # 5) /driver/me returns the real assigned vehicle.
    def test_driver_me_returns_assigned_vehicle(self):
        DriverVehicleAssignment.objects.create(
            company=self.company, driver=self.driver, vehicle=self.vehicle,
            is_active=True)
        self.client.force_authenticate(self.duser)
        body = self.client.get("/api/accounts/driver/me/").json()
        self.assertTrue(body["activated"])
        self.assertIsNotNone(body["vehicle"])
        self.assertEqual(body["vehicle"]["plate_number"], "REAL-1")

    # 6) The live feed never emits a position for a vehicle without telemetry.
    def test_live_feed_hides_position_without_telemetry(self):
        self.client.force_authenticate(self.owner)
        row = next(v for v in self.client.get("/api/accounts/vehicles/live/").json()
                   if v["plate_number"] == "REAL-1")
        self.assertIsNone(row["lat"])
        self.assertIsNone(row["lng"])
        self.assertFalse(row["has_valid_position"])

    # 7) After real telemetry the live feed exposes the real position.
    def test_live_feed_exposes_real_position(self):
        DriverVehicleAssignment.objects.create(
            company=self.company, driver=self.driver, vehicle=self.vehicle,
            is_active=True)
        self.client.force_authenticate(self.duser)
        self._ping()
        self.client.force_authenticate(self.owner)
        row = next(v for v in self.client.get("/api/accounts/vehicles/live/").json()
                   if v["plate_number"] == "REAL-1")
        self.assertTrue(row["has_valid_position"])
        self.assertAlmostEqual(row["lat"], 36.3877306, places=5)
        self.assertIn(row["live_status"], ("MOVING", "STOPPED"))

    # 8) 0,0 is never treated as a real position.
    def test_null_island_is_not_a_valid_position(self):
        self.vehicle.lat, self.vehicle.lng = 0, 0
        self.vehicle.last_seen_at = timezone.now()
        self.assertFalse(has_valid_position(self.vehicle))


class VehicleCreateAssignmentTests(APITestCase):
    """Setting a driver while creating/editing a vehicle must create a REAL
    DriverVehicleAssignment. Previously the dashboard only wrote the legacy
    `driver` name string, so the driver stayed unassigned: /driver/me returned
    no vehicle, telemetry never bound, and Live Map stayed empty.
    """
    def setUp(self):
        self.owner = User.objects.create_user("own2", password="pw123456")
        self.company = Company.objects.create(
            user=self.owner, company_name="Co2", manager_full_name="O", phone="1")
        Membership.objects.create(user=self.owner, company=self.company,
                                  role=Membership.Role.COMPANY_OWNER)
        self.driver = Driver.objects.create(
            full_name="Real Driver", mobile="1", company=self.company)
        # a driver belonging to ANOTHER company
        self.other_owner = User.objects.create_user("own3", password="pw123456")
        self.other_company = Company.objects.create(
            user=self.other_owner, company_name="Co3", manager_full_name="X", phone="2")
        self.foreign_driver = Driver.objects.create(
            full_name="Foreign", mobile="2", company=self.other_company)
        self.client.force_authenticate(self.owner)

    def test_create_vehicle_with_driver_creates_assignment(self):
        r = self.client.post("/api/accounts/vehicles/", {
            "plate_number": "NEW-1", "vehicle_type": "Van",
            "driver_id": self.driver.id,
        }, format="json")
        self.assertIn(r.status_code, (200, 201))
        v = Vehicle.objects.get(plate_number="NEW-1")
        a = DriverVehicleAssignment.objects.filter(vehicle=v, is_active=True).first()
        self.assertIsNotNone(a, "a real assignment must exist")
        self.assertEqual(a.driver_id, self.driver.id)
        self.assertEqual(r.json()["assigned_driver"]["full_name"], "Real Driver")

    def test_edit_vehicle_can_assign_and_unassign(self):
        v = Vehicle.objects.create(company=self.company, plate_number="E-1",
                                   vehicle_type="Van")
        self.client.patch(f"/api/accounts/vehicles/{v.id}/",
                          {"driver_id": self.driver.id}, format="json")
        self.assertTrue(DriverVehicleAssignment.objects
                        .filter(vehicle=v, is_active=True).exists())
        self.client.patch(f"/api/accounts/vehicles/{v.id}/",
                          {"driver_id": None}, format="json")
        self.assertFalse(DriverVehicleAssignment.objects
                         .filter(vehicle=v, is_active=True).exists())

    def test_cannot_assign_another_companys_driver(self):
        r = self.client.post("/api/accounts/vehicles/", {
            "plate_number": "X-1", "vehicle_type": "Van",
            "driver_id": self.foreign_driver.id,
        }, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertFalse(DriverVehicleAssignment.objects
                         .filter(driver=self.foreign_driver).exists())

    def test_broken_linkage_reports_clear_error(self):
        """A user with a DRIVER membership but no Driver record gets an
        explicit message, not a pointless activation prompt."""
        u = User.objects.create_user("orphan", password="pw123456")
        Membership.objects.create(user=u, company=self.company,
                                  role=Membership.Role.DRIVER)
        self.client.force_authenticate(u)
        body = self.client.get("/api/accounts/driver/me/").json()
        self.assertFalse(body["activated"])
        self.assertIn("removed", (body.get("linkage_error") or "").lower())
