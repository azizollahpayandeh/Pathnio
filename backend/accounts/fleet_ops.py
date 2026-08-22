"""
Owner-side review of what drivers submit: inspections, incidents and the
expenses drivers logged on the road.
"""
from django.utils import timezone
from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import VehicleInspection, Incident, Expense
from .tenancy import CompanyScopedQuerysetMixin, IsCompanyMember, IsCompanyOwner, company_for


class InspectionSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.full_name", read_only=True, default="")
    plate_number = serializers.CharField(source="vehicle.plate_number", read_only=True, default="")
    failed_items = serializers.SerializerMethodField()

    class Meta:
        model = VehicleInspection
        fields = ["id", "kind", "odometer", "fuel_percent", "items", "has_defects",
                  "defect_notes", "lat", "lng", "created_at", "driver_name",
                  "plate_number", "failed_items", "trip"]
        read_only_fields = fields

    def get_failed_items(self, obj):
        return [i.get("key") for i in (obj.items or []) if not i.get("ok", True)]


class IncidentSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.full_name", read_only=True, default="")
    plate_number = serializers.CharField(source="vehicle.plate_number", read_only=True, default="")

    class Meta:
        model = Incident
        fields = ["id", "kind", "severity", "description", "lat", "lng",
                  "resolved_at", "created_at", "driver_name", "plate_number", "trip"]
        read_only_fields = ["id", "created_at", "driver_name", "plate_number", "trip"]


class InspectionViewSet(CompanyScopedQuerysetMixin,
                        mixins.ListModelMixin, mixins.RetrieveModelMixin,
                        viewsets.GenericViewSet):
    """Read-only for the owner: inspections are written by drivers only."""
    serializer_class = InspectionSerializer
    permission_classes = [IsCompanyMember]

    def get_queryset(self):
        qs = (VehicleInspection.objects
              .filter(company=company_for(self.request.user))
              .select_related("driver", "vehicle"))
        if self.request.query_params.get("defects") == "1":
            qs = qs.filter(has_defects=True)
        return qs


class IncidentViewSet(CompanyScopedQuerysetMixin,
                      mixins.ListModelMixin, mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = IncidentSerializer
    permission_classes = [IsCompanyMember]

    def get_queryset(self):
        qs = (Incident.objects
              .filter(company=company_for(self.request.user))
              .select_related("driver", "vehicle"))
        if self.request.query_params.get("open") == "1":
            qs = qs.filter(resolved_at__isnull=True)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsCompanyOwner])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.resolved_at = timezone.now()
        incident.save(update_fields=["resolved_at"])
        return Response(self.get_serializer(incident).data)
