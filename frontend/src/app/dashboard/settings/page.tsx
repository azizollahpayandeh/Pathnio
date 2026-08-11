"use client";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui";
import FleetSettingsCard from "@/components/FleetSettingsCard";

// Only REAL, company-scoped settings live here. They persist to PostgreSQL via
// /api/accounts/company/settings/ (survive refresh/logout) and are actually used
// by the backend tracking logic (offline timeout + moving-speed thresholds drive
// the Live Map status; telemetry interval drives the driver app). No decorative
// localStorage toggles that pretend to save but change nothing.
export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Fleet & tracking configuration for your company" gradient="from-slate-500 to-slate-700" />

      <FleetSettingsCard />

      <div className="card p-5 flex items-start gap-3 text-sm text-slate-500">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p>
          These settings are scoped to your company only and take effect immediately across the
          dashboard and the driver app. Changing them never affects any other company.
        </p>
      </div>
    </div>
  );
}
