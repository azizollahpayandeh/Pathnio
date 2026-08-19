"""
Driver-side operations API.

Everything here is written from the phone by an ACTIVATED driver and is scoped
to that driver's own company and own assignment — the client never chooses the
company, the vehicle or the driver; the server derives all three from the
authenticated user. That is the same rule the telemetry ingest already
follows, and it is what stops one company's driver writing into another's data.
"""
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Driver, Trip, Vehicle, VehicleInspection, Incident, Expense, FleetAlert,
)

# The checklist the driver signs off. Kept server-side so every company gets
# the same auditable list and the app cannot invent items.
INSPECTION_ITEMS = [
    "brakes", "tyres", "lights", "mirrors", "windscreen",
    "fluids", "seatbelts", "warning_devices", "bodywork", "load_security",
]


def _driver_or_error(user):
    """Resolve the activated driver behind the request, or a 403 response."""
    driver = Driver.objects.filter(user=user).select_related("company").first()
    if driver is None or driver.company_id is None:
        return None, Response(
            {"detail": "This account is not an activated driver."},
            status=status.HTTP_403_FORBIDDEN,
        )
    return driver, None


def _active_vehicle(driver):
    """The vehicle currently assigned to this driver (never client-supplied)."""
    from .models import DriverVehicleAssignment
    a = (DriverVehicleAssignment.objects
         .filter(driver=driver, is_active=True)
         .select_related("vehicle").first())
    return a.vehicle if a else None


class DriverTripActionView(APIView):
    """Start or complete the driver's own trip, with odometer readings."""
    permission_classes = [IsAuthenticated]

    class InSerializer(serializers.Serializer):
        odometer = serializers.IntegerField(min_value=0, required=False, allow_null=True)
        notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def post(self, request, trip_id, action):
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        if action not in ("start", "complete"):
            return Response({"detail": "Unknown action."}, status=400)

        body = self.InSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        odo = body.validated_data.get("odometer")
        notes = body.validated_data.get("notes", "")

        with transaction.atomic():
            trip = (Trip.objects.select_for_update()
                    .filter(id=trip_id, company=driver.company, driver_ref=driver)
                    .first())
            if trip is None:
                return Response({"detail": "Trip not found."}, status=404)

            now = timezone.now()
            if action == "start":
                if trip.status == "ACTIVE":
                    return Response({"detail": "Trip is already active."}, status=409)
                if trip.status in ("COMPLETED", "CANCELLED"):
                    return Response({"detail": "This trip is already finished."}, status=409)
                trip.status = "ACTIVE"
                trip.started_at = now
                if odo is not None:
                    trip.start_odometer = odo
            else:
                if trip.status != "ACTIVE":
                    return Response({"detail": "Only an active trip can be completed."}, status=409)
                if odo is not None:
                    if trip.start_odometer is not None and odo < trip.start_odometer:
                        return Response(
                            {"odometer": ["Reading is lower than the start reading."]},
                            status=400,
                        )
                    trip.end_odometer = odo
                    # Distance measured from the vehicle, not typed by an office.
                    if trip.start_odometer is not None:
                        trip.distance = odo - trip.start_odometer
                trip.status = "COMPLETED"
                trip.completed_at = now
                trip.end_time = now

            if notes:
                trip.notes = (trip.notes + "\n" if trip.notes else "") + notes
            trip.save()

            # Keep the vehicle odometer honest with the latest real reading.
            if odo is not None and trip.vehicle_ref_id:
                Vehicle.objects.filter(id=trip.vehicle_ref_id, odometer__lt=odo).update(odometer=odo)

        return Response({
            "id": trip.id, "status": trip.status,
            "start_odometer": trip.start_odometer, "end_odometer": trip.end_odometer,
            "distance": trip.distance,
            "started_at": trip.started_at, "completed_at": trip.completed_at,
        }, status=200)


class DriverInspectionView(APIView):
    """Submit a pre/post-trip vehicle inspection. Defects raise a fleet alert."""
    permission_classes = [IsAuthenticated]

    class InSerializer(serializers.Serializer):
        kind = serializers.ChoiceField(choices=["PRE", "POST"])
        odometer = serializers.IntegerField(min_value=0, required=False, allow_null=True)
        items = serializers.ListField(child=serializers.DictField(), allow_empty=True)
        defect_notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)
        lat = serializers.FloatField(required=False, allow_null=True)
        lng = serializers.FloatField(required=False, allow_null=True)
        trip_id = serializers.IntegerField(required=False, allow_null=True)

    def get(self, request):
        """The checklist to render, plus this driver's recent submissions."""
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        recent = (VehicleInspection.objects.filter(driver=driver)
                  .order_by("-created_at")[:10])
        return Response({
            "checklist": INSPECTION_ITEMS,
            "recent": [{
                "id": i.id, "kind": i.kind, "has_defects": i.has_defects,
                "odometer": i.odometer, "created_at": i.created_at,
            } for i in recent],
        })

    def post(self, request):
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        vehicle = _active_vehicle(driver)
        if vehicle is None:
            return Response(
                {"detail": "You have no vehicle assigned, so there is nothing to inspect."},
                status=409,
            )

        body = self.InSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        d = body.validated_data

        # Only keep known checklist keys — the app cannot invent its own items.
        clean, failed = [], []
        for raw in d["items"]:
            key = str(raw.get("key", ""))
            if key not in INSPECTION_ITEMS:
                continue
            ok = bool(raw.get("ok", True))
            note = str(raw.get("note", ""))[:500]
            clean.append({"key": key, "ok": ok, "note": note})
            if not ok:
                failed.append(key)

        trip = None
        if d.get("trip_id"):
            trip = Trip.objects.filter(
                id=d["trip_id"], company=driver.company, driver_ref=driver).first()

        with transaction.atomic():
            inspection = VehicleInspection.objects.create(
                company=driver.company, vehicle=vehicle, driver=driver, trip=trip,
                kind=d["kind"], odometer=d.get("odometer"), items=clean,
                has_defects=bool(failed), defect_notes=d.get("defect_notes", ""),
                lat=d.get("lat"), lng=d.get("lng"),
            )
            if d.get("odometer") is not None:
                Vehicle.objects.filter(id=vehicle.id, odometer__lt=d["odometer"]).update(
                    odometer=d["odometer"])

            if failed:
                # One open alert per vehicle for defects; the alerts engine
                # resolves it when a later clean inspection comes in.
                FleetAlert.objects.get_or_create(
                    company=driver.company, vehicle=vehicle,
                    alert_type="INSPECTION_DEFECT", resolved_at__isnull=True,
                    defaults={
                        "severity": "HIGH",
                        "title": f"Inspection defects on {vehicle.plate_number}",
                        "message": (
                            f"{driver.full_name} reported: {', '.join(failed)}."
                            + (f" {d.get('defect_notes','')}" if d.get("defect_notes") else "")
                        ),
                    },
                )

        return Response({
            "id": inspection.id, "has_defects": inspection.has_defects,
            "failed_items": failed,
        }, status=201)


class DriverIncidentView(APIView):
    """Report a breakdown / accident / delay from the road."""
    permission_classes = [IsAuthenticated]

    class InSerializer(serializers.Serializer):
        kind = serializers.ChoiceField(
            choices=["BREAKDOWN", "ACCIDENT", "DELAY", "THEFT", "OTHER"])
        severity = serializers.ChoiceField(choices=["LOW", "MEDIUM", "HIGH"], default="MEDIUM")
        description = serializers.CharField(max_length=4000)
        lat = serializers.FloatField(required=False, allow_null=True)
        lng = serializers.FloatField(required=False, allow_null=True)
        trip_id = serializers.IntegerField(required=False, allow_null=True)

    def get(self, request):
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        rows = Incident.objects.filter(driver=driver).order_by("-created_at")[:20]
        return Response([{
            "id": i.id, "kind": i.kind, "severity": i.severity,
            "description": i.description, "resolved_at": i.resolved_at,
            "created_at": i.created_at,
        } for i in rows])

    def post(self, request):
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        body = self.InSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        d = body.validated_data

        trip = None
        if d.get("trip_id"):
            trip = Trip.objects.filter(
                id=d["trip_id"], company=driver.company, driver_ref=driver).first()
        vehicle = _active_vehicle(driver)

        with transaction.atomic():
            incident = Incident.objects.create(
                company=driver.company, driver=driver, vehicle=vehicle, trip=trip,
                kind=d["kind"], severity=d["severity"], description=d["description"],
                lat=d.get("lat"), lng=d.get("lng"),
            )
            # Surface it to the owner immediately through the existing alert feed.
            FleetAlert.objects.create(
                company=driver.company, vehicle=vehicle,
                alert_type="INCIDENT",
                severity="HIGH" if d["severity"] == "HIGH" else "MEDIUM",
                title=f"{d['kind'].title()} reported by {driver.full_name}",
                message=d["description"][:500],
            )
        return Response({"id": incident.id}, status=201)


class DriverExpenseView(APIView):
    """Log a cost from the road. Arrives PENDING for the owner to approve."""
    permission_classes = [IsAuthenticated]

    class InSerializer(serializers.Serializer):
        category = serializers.CharField(max_length=32)
        amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))
        date = serializers.DateField(required=False)
        description = serializers.CharField(required=False, allow_blank=True, max_length=2000)
        odometer = serializers.IntegerField(min_value=0, required=False, allow_null=True)
        liters = serializers.DecimalField(max_digits=8, decimal_places=2,
                                          required=False, allow_null=True)

    def get(self, request):
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        rows = (Expense.objects.filter(company=driver.company, submitted_by=request.user)
                .order_by("-date", "-id")[:20])
        return Response([{
            "id": e.id, "title": e.title, "category": e.category,
            "amount": str(e.amount), "date": e.date, "approval": e.approval,
        } for e in rows])

    def post(self, request):
        driver, err = _driver_or_error(request.user)
        if err:
            return err
        body = self.InSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        d = body.validated_data
        vehicle = _active_vehicle(driver)

        expense = Expense.objects.create(
            company=driver.company,
            title=f"{d['category']}{' — ' + vehicle.plate_number if vehicle else ''}",
            category=d["category"],
            amount=d["amount"],
            date=d.get("date") or timezone.now().date(),
            description=d.get("description", ""),
            plate_number=vehicle.plate_number if vehicle else "",
            driver=driver.full_name,
            status="Pending",
            source="DRIVER",
            approval="PENDING",
            submitted_by=request.user,
            odometer=d.get("odometer"),
            liters=d.get("liters"),
        )
        if d.get("odometer") is not None and vehicle is not None:
            Vehicle.objects.filter(id=vehicle.id, odometer__lt=d["odometer"]).update(
                odometer=d["odometer"])
        return Response({"id": expense.id, "approval": expense.approval}, status=201)
