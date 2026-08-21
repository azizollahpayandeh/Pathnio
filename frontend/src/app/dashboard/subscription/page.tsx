"use client";
import { useState } from "react";
import { CreditCard, Check, Crown, Zap, Rocket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui";
import FloatingAlert from "@/components/FloatingAlert";
import { useSubscription, changePlan } from "@/lib/api-data";
import { useT, useTValue } from "@/i18n";

// Map the display cards to backend plan codes.
const ID_TO_CODE: Record<string, string> = { starter: "STARTER", pro: "PRO", enterprise: "BUSINESS" };
const CODE_TO_ID: Record<string, string> = { FREE: "starter", STARTER: "starter", PRO: "pro", BUSINESS: "enterprise" };

const PLANS = [
  {
    id: "starter", nameKey: "ui.starter", price: 0, icon: Zap, tone: "from-slate-500 to-slate-700",
    taglineKey: "ui.val_for_small_teams_getting_started",
    features: ["Up to 5 vehicles", "Live map tracking", "Basic reports", "Email support"],
  },
  {
    id: "pro", nameKey: "ui.professional", price: 49, icon: Rocket, tone: "from-violet-500 to-purple-600",
    taglineKey: "ui.val_for_growing_fleets", popular: true,
    features: ["Up to 50 vehicles", "Advanced analytics", "Driver performance", "Priority support", "Expense management", "Custom alerts"],
  },
  {
    id: "enterprise", nameKey: "ui.enterprise", price: 149, icon: Crown, tone: "from-purple-500 to-fuchsia-600",
    taglineKey: "ui.val_for_large_operations",
    features: ["Unlimited vehicles", "API access", "Dedicated manager", "SLA guarantee", "Custom integrations", "24/7 phone support"],
  },
];

export default function SubscriptionPage() {
  const tr = useT();
  const tv = useTValue();
  const { data: sub, error: subError, refetch } = useSubscription();
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const current = sub ? (CODE_TO_ID[sub.plan.code] || "pro") : "pro";

  const choose = async (id: string, name: string) => {
    try {
      await changePlan(ID_TO_CODE[id] || "PRO");
      await refetch();
      setAlert({ type: "success", msg: `You're now on the ${name} plan.` });
    } catch {
      setAlert({ type: "error", msg: "Could not change plan." });
    }
    setTimeout(() => setAlert(null), 2600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={CreditCard} title={tr("ui.subscription")} subtitle={tr("ui.choose_the_plan_that_fits_your_fleet")} gradient="from-teal-500 to-emerald-600" />

      {subError && !sub && (
        <div className="card p-4 border-rose-200 bg-rose-50 text-rose-700 text-sm">{tr("ui.could_not_load_subscription")}</div>
      )}

      {sub && (
        <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">{tr("ui.current_plan")}</div>
            <div className="font-bold text-lg text-slate-900">{tv(sub.plan.name)} <span className="text-xs font-medium text-slate-400">· {tv(sub.status)}</span></div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-slate-500">{tr("ui.drivers")}</div>
              <div className="font-semibold text-slate-800">{sub.usage.drivers} / {sub.plan.max_drivers}</div>
            </div>
            <div>
              <div className="text-slate-500">{tr("ui.vehicles")}</div>
              <div className="font-semibold text-slate-800">{sub.usage.vehicles} / {sub.plan.max_vehicles}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger">
        {PLANS.map((p) => {
          const Icon = p.icon;
          const active = current === p.id;
          return (
            <div
              key={p.id}
              className={`card p-6 relative flex flex-col ${p.popular ? "ring-2 ring-violet-500 shadow-brand" : ""} card-hover`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-violet-600 text-white border-0 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" /> {tr("ui.most_popular")}
                </span>
              )}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.tone} flex items-center justify-center shadow-md mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{tr(p.nameKey)}</h3>
              <p className="text-slate-500 text-sm mb-4">{tr(p.taglineKey)}</p>
              <div className="mb-5">
                <span className="text-4xl font-bold text-slate-900">€{p.price}</span>
                <span className="text-slate-400">{tr("ui.per_month")}</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-slate-600 text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(p.id, tr(p.nameKey))}
                className={`btn w-full ${active ? "btn-ghost cursor-default" : "btn-primary"}`}
                disabled={active}
              >
                {active ? (<><Check className="w-4 h-4" /> {tr("ui.current_plan")}</>) : tr("ui.choose_plan_btn")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-1">{tr("ui.billing")}</h2>
        <p className="text-sm text-slate-500">{tr("ui.you_are_currently_on_the")} <span className="font-semibold text-violet-600">{(() => { const pl = PLANS.find((p) => p.id === current); return pl ? tr(pl.nameKey) : ""; })()}</span> — {tr("ui.billing_note")}</p>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
