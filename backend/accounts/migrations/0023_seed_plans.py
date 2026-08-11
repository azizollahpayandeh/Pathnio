from django.db import migrations


PLANS = [
    # code, name, max_drivers, max_vehicles, price_monthly
    ("FREE", "Free / Trial", 2, 2, 0),
    ("STARTER", "Starter", 10, 10, 29),
    ("PRO", "Pro", 50, 50, 99),
    ("BUSINESS", "Business", 1000, 1000, 299),
]


def seed(apps, schema_editor):
    Plan = apps.get_model("accounts", "Plan")
    Subscription = apps.get_model("accounts", "Subscription")
    Company = apps.get_model("accounts", "Company")

    plans = {}
    for code, name, md, mv, price in PLANS:
        p, _ = Plan.objects.get_or_create(
            code=code,
            defaults={"name": name, "max_drivers": md, "max_vehicles": mv,
                      "price_monthly": price})
        plans[code] = p

    # Existing companies -> Business/Trial so their current fleet isn't blocked.
    business = plans["BUSINESS"]
    for company in Company.objects.all():
        Subscription.objects.get_or_create(
            company=company, defaults={"plan": business, "status": "TRIAL"})


def unseed(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("accounts", "0022_plan_subscription")]
    operations = [migrations.RunPython(seed, unseed)]
