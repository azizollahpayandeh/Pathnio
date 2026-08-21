"""
Internal subscription/plan enforcement (Phase 18). No external payment provider.
"""
from rest_framework.exceptions import ValidationError

from .models import Subscription, Plan, Driver, Vehicle

# Existing companies (and any without an explicit sub) default to the top plan
# so nothing they already have is retroactively blocked.
DEFAULT_PLAN_CODE = "BUSINESS"


def get_or_create_subscription(company):
    sub = Subscription.objects.filter(company=company).select_related("plan").first()
    if sub:
        return sub
    plan = (Plan.objects.filter(code=DEFAULT_PLAN_CODE).first()
            or Plan.objects.order_by("-max_drivers").first())
    return Subscription.objects.create(company=company, plan=plan)


def lock_subscription_for_plan_check(company):
    """Row-lock the company's Subscription for the rest of the current
    transaction.

    check_can_add() is a count-then-create check: without a lock, two
    concurrent requests can both count N (under the limit), both pass, and
    both create — overshooting the plan limit. Call this INSIDE a
    transaction.atomic() block, before check_can_add() and the actual
    Driver/Vehicle create, so the two concurrent requests serialize on this
    row instead of racing.
    """
    get_or_create_subscription(company)  # ensure a row exists to lock
    return Subscription.objects.select_for_update().get(company=company)


def check_can_add(company, kind):
    """Raise if the company is at its plan limit for `kind` ('driver'|'vehicle').

    Callers that need this to be race-free under concurrent requests must
    call lock_subscription_for_plan_check(company) first, inside the same
    transaction.atomic() block that performs the create.
    """
    sub = get_or_create_subscription(company)
    plan = sub.plan
    if kind == "driver" and Driver.objects.filter(company=company).count() >= plan.max_drivers:
        raise ValidationError(
            {"detail": f"Driver limit reached for the {plan.name} plan "
                       f"({plan.max_drivers}). Upgrade to add more."})
    if kind == "vehicle" and Vehicle.objects.filter(company=company).count() >= plan.max_vehicles:
        raise ValidationError(
            {"detail": f"Vehicle limit reached for the {plan.name} plan "
                       f"({plan.max_vehicles}). Upgrade to add more."})


def usage(company):
    sub = get_or_create_subscription(company)
    return {
        "plan": {"code": sub.plan.code, "name": sub.plan.name,
                 "max_drivers": sub.plan.max_drivers, "max_vehicles": sub.plan.max_vehicles,
                 "price_monthly": str(sub.plan.price_monthly)},
        "status": sub.status,
        "usage": {"drivers": Driver.objects.filter(company=company).count(),
                  "vehicles": Vehicle.objects.filter(company=company).count()},
    }
