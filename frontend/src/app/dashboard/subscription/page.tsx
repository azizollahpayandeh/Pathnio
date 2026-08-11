"use client";
import { useState } from "react";
import { CreditCard, Check, Crown, Zap, Rocket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui";
import FloatingAlert from "@/components/FloatingAlert";
import { useSubscription, changePlan } from "@/lib/api-data";

// Map the display cards to backend plan codes.
const ID_TO_CODE: Record<string, string> = { starter: "STARTER", pro: "PRO", enterprise: "BUSINESS" };
const CODE_TO_ID: Record<string, string> = { FREE: "starter", STARTER: "starter", PRO: "pro", BUSINESS: "enterprise" };

const PLANS = [
  {
    id: "starter", name: "Starter", price: 0, icon: Zap, tone: "from-slate-500 to-slate-700",
    tagline: "For small teams getting started",
    features: ["Up to 5 vehicles", "Live map tracking", "Basic reports", "Email support"],
  },
  {
    id: "pro", name: "Professional", price: 49, icon: Rocket, tone: "from-violet-500 to-purple-600",
    tagline: "For growing fleets", popular: true,
    features: ["Up to 50 vehicles", "Advanced analytics", "Driver performance", "Priority support", "Expense management", "Custom alerts"],
  },
  {
    id: "enterprise", name: "Enterprise", price: 149, icon: Crown, tone: "from-purple-500 to-fuchsia-600",
    tagline: "For large operations",
    features: ["Unlimited vehicles", "API access", "Dedicated manager", "SLA guarantee", "Custom integrations", "24/7 phone support"],
  },
];

export default function SubscriptionPage() {
  const { data: sub, refetch } = useSubscription();
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
      <PageHeader icon={CreditCard} title="Subscription" subtitle="Choose the plan that fits your fleet" gradient="from-teal-500 to-emerald-600" />

      {sub && (
        <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Current plan</div>
            <div className="font-bold text-lg text-slate-900">{sub.plan.name} <span className="text-xs font-medium text-slate-400">· {sub.status}</span></div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-slate-500">Drivers</div>
              <div className="font-semibold text-slate-800">{sub.usage.drivers} / {sub.plan.max_drivers}</div>
            </div>
            <div>
              <div className="text-slate-500">Vehicles</div>
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
                  <Sparkles className="w-3.5 h-3.5" /> Most popular
                </span>
              )}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.tone} flex items-center justify-center shadow-md mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{p.tagline}</p>
              <div className="mb-5">
                <span className="text-4xl font-bold text-slate-900">€{p.price}</span>
                <span className="text-slate-400">/month</span>
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
                onClick={() => choose(p.id, p.name)}
                className={`btn w-full ${active ? "btn-ghost cursor-default" : "btn-primary"}`}
                disabled={active}
              >
                {active ? (<><Check className="w-4 h-4" /> Current plan</>) : "Choose plan"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-1">Billing</h2>
        <p className="text-sm text-slate-500">You are currently on the <span className="font-semibold text-violet-600">{PLANS.find((p) => p.id === current)?.name}</span> plan. Invoices and payment methods would appear here in production.</p>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
