"""
Platform administration API.

This is the SUPER-admin surface (is_staff), distinct from a company owner: it
sees ACROSS all companies to run the whole SaaS. Every endpoint here is gated
by IsAdminUser, so a normal company owner can never reach it — the company
isolation that protects tenants does not apply to the platform operator.
"""
from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Company, Driver, Vehicle, Trip, Expense, ContactMessage,
    Subscription, Plan, Membership, FleetAlert,
)


class AdminOverviewView(APIView):
    """Top-line platform metrics for the admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_ago = now - timedelta(days=30)

        subs = Subscription.objects.select_related("plan")
        # Monthly recurring revenue = sum of the plan price of every ACTIVE sub.
        mrr = sum(
            (s.plan.price_monthly for s in subs if s.status == Subscription.Status.ACTIVE),
            start=0,
        )
        plan_rows = (
            Subscription.objects.values("plan__code", "plan__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response({
            "companies": Company.objects.count(),
            "companies_new_30d": Company.objects.filter(date_joined__gte=month_ago).count(),
            "users": User.objects.count(),
            "staff": User.objects.filter(is_staff=True).count(),
            "drivers": Driver.objects.count(),
            "vehicles": Vehicle.objects.count(),
            "trips": Trip.objects.count(),
            "open_alerts": FleetAlert.objects.filter(resolved_at__isnull=True).count(),
            "open_messages": ContactMessage.objects.filter(status="open").count(),
            "mrr": str(mrr),
            "subscriptions": {
                "active": subs.filter(status=Subscription.Status.ACTIVE).count(),
                "trial": subs.filter(status=Subscription.Status.TRIAL).count(),
                "cancelled": subs.filter(status=Subscription.Status.CANCELLED).count(),
            },
            "plan_distribution": [
                {"code": r["plan__code"], "name": r["plan__name"], "count": r["count"]}
                for r in plan_rows
            ],
        })


class AdminCompanyListView(APIView):
    """Every company on the platform, with the numbers an operator needs."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        companies = (
            Company.objects
            .select_related("user", "subscription", "subscription__plan")
            .annotate(
                driver_count=Count("drivers", distinct=True),
                vehicle_count=Count("vehicles", distinct=True),
            )
            .order_by("-date_joined")
        )
        out = []
        for c in companies:
            sub = getattr(c, "subscription", None)
            out.append({
                "id": c.id,
                "company_name": c.company_name,
                "manager_full_name": c.manager_full_name,
                "email": c.user.email if c.user_id else "",
                "phone": c.phone,
                "date_joined": c.date_joined,
                "driver_count": c.driver_count,
                "vehicle_count": c.vehicle_count,
                "is_active": c.user.is_active if c.user_id else False,
                "plan": sub.plan.code if sub else None,
                "plan_name": sub.plan.name if sub else None,
                "subscription_status": sub.status if sub else None,
            })
        return Response(out)


class AdminCompanyActionView(APIView):
    """Suspend or reactivate a company.

    Suspending disables login for the owner AND every driver of that company
    (is_active=False), so the whole tenant is frozen without deleting any data.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, company_id, action):
        if action not in ("suspend", "activate"):
            return Response({"detail": "Unknown action."}, status=400)
        company = Company.objects.select_related("user").filter(id=company_id).first()
        if not company:
            return Response({"detail": "Company not found."}, status=404)

        active = action == "activate"
        # Never let an admin lock themselves out of their own account.
        if company.user_id == request.user.id and not active:
            return Response({"detail": "You cannot suspend your own account."}, status=400)

        driver_user_ids = list(
            Driver.objects.filter(company=company, user__isnull=False)
            .values_list("user_id", flat=True)
        )
        ids = driver_user_ids + ([company.user_id] if company.user_id else [])
        User.objects.filter(id__in=ids).update(is_active=active)
        return Response({"id": company.id, "is_active": active})


class AdminMessageListView(APIView):
    """Contact-form submissions from the public site."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = ContactMessage.objects.order_by("-id")
        if request.query_params.get("open") == "1":
            qs = qs.filter(status="open")
        return Response([{
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "subject": m.subject,
            "message": m.message,
            "reply": m.reply or "",
            "status": m.status,
            "created_at": m.created_at,
            "answered_at": m.answered_at,
        } for m in qs[:100]])
