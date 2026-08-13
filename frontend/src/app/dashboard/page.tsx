"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import Link from "next/link";
import {
  Users, Truck, Route, Wallet, TrendingUp, ArrowUpRight,
  CheckCircle2, Clock, Maximize2,
} from "lucide-react";
import { useVehicles, useDrivers, useTrips, useExpenses, useFleetAlerts } from "@/lib/api-data";
import { StatCard, Badge } from "@/components/ui";
import type { TripStatus } from "@/lib/types";
import { useT } from "@/i18n";
import { useUnits } from "@/lib/format";

const LiveMap = dynamic(() => import("../../components/LiveMapWidget"), { ssr: false });


const tripTone: Record<TripStatus, string> = {
  COMPLETED: "green",
  ACTIVE: "blue",
  PLANNED: "amber",
  CANCELLED: "red",
};

export default function Dashboard() {
  const tr = useT();
  const { currency, distance } = useUnits();
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  const { data: trips } = useTrips();
  const { data: expenses } = useExpenses();
  const { data: alerts } = useFleetAlerts();
  const openAlerts = alerts.filter((a) => !a.read).slice(0, 4);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const revenueWeek = trips
      .filter((t) => new Date(t.start_time).getTime() >= weekAgo && t.status !== "CANCELLED")
      .reduce((s, t) => s + t.revenue, 0);
    const expensesMonth = expenses
      .filter((e) => new Date(e.date).getTime() >= monthStart.getTime())
      .reduce((s, e) => s + e.amount, 0);

    return {
      activeDrivers: drivers.filter((d) => d.status !== "Inactive").length,
      totalDrivers: drivers.length,
      onlineVehicles: vehicles.filter((v) => v.status === "Active").length,
      totalVehicles: vehicles.length,
      ongoingTrips: trips.filter((t) => t.status === "ACTIVE").length,
      completedTrips: trips.filter((t) => t.status === "COMPLETED").length,
      revenueWeek,
      expensesMonth,
    };
  }, [vehicles, drivers, trips, expenses]);

  // Weekly trip distribution (Mon..Sun)
  const weekBars = useMemo(() => {
    const labels = ["mon","tue","wed","thu","fri","sat","sun"].map((d) => tr(`ui.wd_${d}`));
    const counts = new Array(7).fill(0);
    trips.forEach((t) => {
      const d = new Date(t.start_time).getDay(); // 0=Sun
      const idx = d === 0 ? 6 : d - 1;
      counts[idx] += 1;
    });
    const max = Math.max(1, ...counts);
    return labels.map((l, i) => ({ label: l, value: counts[i], pct: (counts[i] / max) * 100 }));
  }, [trips, tr]);

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={Users}
          label={tr("ui.active_drivers")}
          value={stats.activeDrivers}
          hint={tr("dashboard.ofTotal", { count: stats.totalDrivers })}
          gradient="from-purple-500 to-violet-600"
        />
        <StatCard
          icon={Truck}
          label={tr("ui.online_vehicles")}
          value={stats.onlineVehicles}
          hint={tr("dashboard.ofTotal", { count: stats.totalVehicles })}
          gradient="from-orange-500 to-amber-600"
        />
        <StatCard
          icon={Route}
          label={tr("ui.active_trips")}
          value={stats.ongoingTrips}
          hint={tr("dashboard.completed", { count: stats.completedTrips })}
          gradient="from-purple-500 to-fuchsia-600"
        />
        <StatCard
          icon={TrendingUp}
          label={tr("ui.revenue_7_days")}
          value={currency(stats.revenueWeek)}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live map */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {tr("ui.live_vehicle_map")}
            </h2>
            <Link
              href="/dashboard/live-map"
              className="btn btn-ghost text-sm py-2"
            >
              <Maximize2 className="w-4 h-4" /> {tr("ui.full_map")}
            </Link>
          </div>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="h-[360px] lg:h-[440px] rounded-2xl overflow-hidden">
              <LiveMap />
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Weekly trips chart */}
          <div className="card p-6">
            <h2 className="font-bold text-slate-800 mb-1">{tr("ui.trips_this_week")}</h2>
            <p className="text-sm text-slate-500 mb-4">{tr("dashboard.totalRecords", { count: trips.length })}</p>
            <div className="flex items-end justify-between gap-2 h-36">
              {weekBars.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-28">
                    <div
                      className="w-full max-w-[26px] rounded-lg bg-gradient-to-t from-violet-600 to-purple-400 shadow-sm transition-all"
                      style={{ height: `${Math.max(6, b.pct)}%` }}
                      title={`${b.value} trips`}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Finance summary */}
          <div className="card p-6 bg-gradient-to-br from-violet-600 to-purple-700 text-white border-0 shadow-brand">
            <div className="flex items-center gap-2 text-violet-100 mb-1">
              <Wallet className="w-4 h-4" /> {tr("ui.expenses_this_month")}
            </div>
            <div className="text-3xl font-bold">{currency(stats.expensesMonth)}</div>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <div>
                <div className="text-violet-100 text-sm">{tr("ui.net_7d")}</div>
                <div className="text-xl font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  {currency(stats.revenueWeek)}
                </div>
              </div>
              <Link href="/dashboard/expenses" className="btn bg-white/15 hover:bg-white/25 text-white text-sm">
                {tr("ui.view")}
              </Link>
            </div>
          </div>

          {/* Recent alerts (real) */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">{tr("ui.recent_alerts")}</h2>
              <Link href="/dashboard/alerts" className="text-violet-600 text-sm font-semibold hover:text-violet-800">{tr("common.viewAll")}</Link>
            </div>
            {openAlerts.length === 0 ? (
              <p className="text-sm text-slate-400">{tr("ui.no_open_alerts_fleet_looks_healthy")}</p>
            ) : (
              <ul className="space-y-2">
                {openAlerts.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-sm">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.priority === "critical" ? "bg-rose-500" : a.priority === "high" ? "bg-amber-500" : "bg-violet-500"}`} />
                    <span className="text-slate-700">{a.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recent trips */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">{tr("ui.recent_trips")}</h2>
          <Link href="/dashboard/trips" className="text-violet-600 font-semibold text-sm hover:text-violet-800">
            {tr("common.viewAll")}
          </Link>
        </div>
        <div className="overflow-x-auto scroll-slim">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-3 px-6 font-semibold">{tr("ui.route")}</th>
                <th className="py-3 px-4 font-semibold">{tr("ui.driver")}</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">{tr("ui.vehicle")}</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">{tr("ui.distance")}</th>
                <th className="py-3 px-4 font-semibold">{tr("ui.revenue")}</th>
                <th className="py-3 px-6 font-semibold">{tr("ui.status")}</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-6 font-semibold text-slate-800 whitespace-nowrap">
                    {t.origin} <span className="text-slate-300">→</span> {t.destination}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{t.driver}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono hidden md:table-cell">{t.plate_number}</td>
                  <td className="py-3.5 px-4 text-slate-600 hidden sm:table-cell">{distance(t.distance)}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{currency(t.revenue)}</td>
                  <td className="py-3.5 px-6">
                    <Badge tone={tripTone[t.status]} icon={t.status === "COMPLETED" ? CheckCircle2 : Clock}>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
