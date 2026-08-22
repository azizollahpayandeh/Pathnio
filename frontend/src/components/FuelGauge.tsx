"use client";
import { Fuel } from "lucide-react";
import { useT } from "@/i18n";

/**
 * Honest fuel gauge. Shows a real reading only when a driver has actually
 * reported one (reportedAt set); otherwise it renders "—" instead of the
 * old fake default of 100%.
 */
export default function FuelGauge({
  level,
  reportedAt,
}: {
  level: number;
  reportedAt?: string | null;
}) {
  const tr = useT();
  const has = !!reportedAt;
  const pct = Math.max(0, Math.min(100, Math.round(level)));
  const tone =
    pct <= 15 ? "bg-rose-500" : pct <= 35 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Fuel className="w-4 h-4" /> {tr("ui.fuel_level")}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {has ? `${pct}%` : "—"}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        {has && (
          <div
            className={`h-full rounded-full ${tone} transition-all`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1.5">
        {has
          ? tr("ui.fuel_reported", { when: new Date(reportedAt!).toLocaleDateString() })
          : tr("ui.fuel_not_reported")}
      </p>
    </div>
  );
}
