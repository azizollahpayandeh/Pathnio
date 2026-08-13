"use client";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui";
import FleetSettingsCard from "@/components/FleetSettingsCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useT } from "@/i18n";

// Only REAL, persisted settings live here. Fleet/tracking config is stored per
// company in PostgreSQL (/api/accounts/company/settings/) and actually drives
// backend behaviour: offline timeout + moving-speed thresholds decide Live Map
// status, and telemetry interval is served to the driver app. Language is
// stored per user (/api/accounts/preferences/) so it follows the account.
export default function SettingsPage() {
  const tr = useT();
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader
        icon={SettingsIcon}
        title={tr("settings.title")}
        subtitle={tr("settings.subtitle")}
        gradient="from-slate-500 to-slate-700"
      />

      <LanguageSwitcher />

      <FleetSettingsCard />

      <div className="card p-5 flex items-start gap-3 text-sm text-slate-500">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p>{tr("settings.scopeNote")}</p>
      </div>
    </div>
  );
}
