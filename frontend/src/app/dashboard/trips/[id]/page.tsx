"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, User, Truck, Calendar, Navigation, Package,
  TrendingUp, Route as RouteIcon, CheckCircle2, Clock, CalendarClock, XCircle,
} from "lucide-react";
import { useTrips } from "@/lib/api-data";
import { Badge, EmptyState } from "@/components/ui";
import type { TripStatus } from "@/lib/types";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

const tone: Record<TripStatus, string> = { COMPLETED: "green", ACTIVE: "blue", PLANNED: "amber", CANCELLED: "red" };
const icon: Record<TripStatus, typeof Clock> = { COMPLETED: CheckCircle2, ACTIVE: Navigation, PLANNED: CalendarClock, CANCELLED: XCircle };

export default function TripDetail() {
  const tr = useT();
  const tv = useTValue();
  const { currency, distance } = useUnits();
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { data: trips } = useTrips();
  const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);

  if (!trip) {
    return <div className="card"><EmptyState icon={RouteIcon} title={tr("ui.trip_not_found")} action={<Link href="/dashboard/trips" className="btn btn-primary mx-auto">{tr("ui.back_to_trips")}</Link>} /></div>;
  }
  const SIcon = icon[trip.status];
  const specs = [
    { icon: User, label: tr("ui.driver"), value: trip.driver || tr("ui.unassigned") },
    { icon: Truck, label: tr("ui.vehicle"), value: trip.plate_number || "—" },
    { icon: RouteIcon, label: tr("ui.distance"), value: `${distance(trip.distance)}` },
    { icon: Package, label: tr("ui.cargo"), value: trip.cargo || "—" },
    { icon: TrendingUp, label: tr("ui.revenue"), value: currency(trip.revenue) },
    { icon: Calendar, label: tr("ui.start"), value: new Date(trip.start_time).toLocaleString() },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost"><ArrowLeft className="w-4 h-4" /> {tr("ui.back")}</button>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-slate-900">
            <MapPin className="w-7 h-7 text-purple-500" />
            {trip.origin} <span className="text-slate-300">→</span> {trip.destination}
          </div>
          <Badge tone={tone[trip.status]} icon={SIcon}>{tv(trip.status)}</Badge>
        </div>

        {/* Route progress */}
        <div className="mt-8 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
          <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
        </div>
        <div className="flex justify-between text-sm text-slate-500 mt-1">
          <span>{trip.origin}</span>
          <span>{trip.destination}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {specs.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <s.icon className="w-5 h-5 text-slate-400 mb-2" />
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="font-semibold text-slate-800 truncate">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
