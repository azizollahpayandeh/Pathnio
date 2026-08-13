"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Route, Search, Plus, Eye, Trash2, MapPin, Navigation,
  CheckCircle2, Clock, CalendarClock, XCircle, TrendingUp,
} from "lucide-react";
import AddTripModal, { NewTrip } from "@/components/AddTripModal";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import { useTrips, createTrip, deleteTrip, createCargo } from "@/lib/api-data";
import type { TripStatus } from "@/lib/types";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

const tone: Record<TripStatus, string> = { COMPLETED: "green", ACTIVE: "blue", PLANNED: "amber", CANCELLED: "red" };
const icon: Record<TripStatus, typeof Clock> = { COMPLETED: CheckCircle2, ACTIVE: Navigation, PLANNED: CalendarClock, CANCELLED: XCircle };
const label: Record<TripStatus, string> = { COMPLETED: "Completed", ACTIVE: "Active", PLANNED: "Planned", CANCELLED: "Cancelled" };

export default function TripsPage() {
  const tr = useT();
  const tv = useTValue();
  const { currency, distance } = useUnits();
  const { data: trips, refetch } = useTrips();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () =>
      [...trips]
        .filter(
          (t) =>
            (t.origin.toLowerCase().includes(search.toLowerCase()) ||
              t.destination.toLowerCase().includes(search.toLowerCase()) ||
              t.driver.toLowerCase().includes(search.toLowerCase())) &&
            (status === "all" || t.status === status)
        )
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    [trips, search, status]
  );

  const stats = {
    total: trips.length,
    ongoing: trips.filter((t) => t.status === "ACTIVE").length,
    completed: trips.filter((t) => t.status === "COMPLETED").length,
    revenue: trips.filter((t) => t.status !== "CANCELLED").reduce((s, t) => s + t.revenue, 0),
  };

  const addTrip = async (t: NewTrip) => {
    const trip = await createTrip(t as unknown as Record<string, unknown>);
    // Capture the load as a real Cargo record when provided.
    if (t.cargo?.trim()) {
      try {
        await createCargo({ trip: trip.id, description: t.cargo.trim(), quantity: 1 });
      } catch { /* trip is still created */ }
    }
    await refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteTrip(id);
    await refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Route}
        title={tr("ui.trips")}
        subtitle={tr("ui.every_journey_tracked")}
        gradient="from-purple-500 to-fuchsia-600"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> {tr("ui.new_trip")}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Route} label={tr("ui.total_trips")} value={stats.total} gradient="from-purple-500 to-fuchsia-600" />
        <StatCard icon={Navigation} label={tr("ui.active")} value={stats.ongoing} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={CheckCircle2} label={tr("ui.completed")} value={stats.completed} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={TrendingUp} label={tr("ui.revenue")} value={currency(stats.revenue)} gradient="from-amber-500 to-orange-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_route_or_driver")} className="field pl-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field sm:w-48">
          <option value="all">{tr("ui.all_status")}</option>
          <option value="PLANNED">{tr("ui.planned")}</option>
          <option value="ACTIVE">{tr("ui.active")}</option>
          <option value="COMPLETED">{tr("ui.completed")}</option>
          <option value="CANCELLED">{tr("ui.cancelled")}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Route} title={tr("ui.no_trips_found")} description="Schedule a new trip to get started."
            action={<button onClick={() => setShowAdd(true)} className="btn btn-primary mx-auto"><Plus className="w-4 h-4" /> {tr("ui.new_trip")}</button>} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6 font-semibold">{tr("ui.route")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.driver")}</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">{tr("ui.vehicle")}</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">{tr("ui.distance")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.revenue")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.status")}</th>
                  <th className="py-3.5 px-6 font-semibold text-right">{tr("ui.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const SIcon = icon[t.status];
                  return (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 whitespace-nowrap">
                          <MapPin className="w-4 h-4 text-purple-500" />{t.origin}
                          <span className="text-slate-300">→</span>{t.destination}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{t.cargo}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{t.driver || "—"}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono hidden md:table-cell">{t.plate_number || "—"}</td>
                      <td className="py-3.5 px-4 text-slate-600 hidden sm:table-cell">{distance(t.distance)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{currency(t.revenue)}</td>
                      <td className="py-3.5 px-4"><Badge tone={tone[t.status]} icon={SIcon}>{label[t.status]}</Badge></td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/trips/${t.id}`} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition" aria-label={tr("ui.view")}>
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(t.id)} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition" aria-label={tr("ui.delete")}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddTripModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAddTrip={addTrip} />
    </div>
  );
}
