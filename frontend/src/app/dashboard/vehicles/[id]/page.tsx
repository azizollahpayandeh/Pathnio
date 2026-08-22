"use client";
import { useParams, useRouter } from "next/navigation";
import FuelGauge from "@/components/FuelGauge";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Truck, User, Palette, Weight, Route as RouteIcon,
  Wrench, CheckCircle, XCircle, Calendar,
} from "lucide-react";
import { useExpenses, useTrips, useVehicles } from "@/lib/api-data";
import { Badge, EmptyState } from "@/components/ui";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

const statusTone: Record<string, string> = { Active: "green", Inactive: "gray", Maintenance: "blue" };

export default function VehicleDetail() {
  const tr = useT();
  const tv = useTValue();
  const { currency, distance } = useUnits();
  const params = useParams();
  const router = useRouter();
  const plate = decodeURIComponent(String(params.id));
  const { data: vehicles } = useVehicles();
  const { data: trips } = useTrips();
  const { data: expenses } = useExpenses();

  const vehicle = useMemo(() => vehicles.find((v) => v.plate_number === plate), [vehicles, plate]);
  const vTrips = useMemo(() => (vehicle ? trips.filter((t) => t.vehicle_ref === vehicle.id) : []), [trips, vehicle]);
  const vExpenses = useMemo(() => (vehicle ? expenses.filter((e) => e.vehicleId === vehicle.id) : []), [expenses, vehicle]);

  if (!vehicle) {
    return (
      <div className="card"><EmptyState icon={Truck} title={tr("ui.vehicle_not_found")} description={`No vehicle with plate ${plate}.`} action={<Link href="/dashboard/vehicles" className="btn btn-primary mx-auto">{tr("ui.back_to_vehicles")}</Link>} /></div>
    );
  }

  const specs = [
    { icon: User, label: tr("ui.driver"), value: vehicle.driver || tr("ui.unassigned") },
    { icon: Weight, label: tr("ui.capacity"), value: vehicle.capacity || "—" },
    { icon: Palette, label: tr("ui.color"), value: vehicle.color || "—" },
    { icon: Truck, label: tr("ui.type"), value: tv(vehicle.vehicle_type) },
    { icon: RouteIcon, label: tr("ui.trips"), value: vTrips.length },
    { icon: Calendar, label: tr("ui.added"), value: new Date(vehicle.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost"><ArrowLeft className="w-4 h-4" /> {tr("ui.back")}</button>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-brand">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900">{vehicle.plate_number}</h1>
              <Badge tone={statusTone[vehicle.status]} icon={vehicle.status === "Active" ? CheckCircle : vehicle.status === "Maintenance" ? Wrench : XCircle}>{tv(vehicle.status)}</Badge>
              <Badge tone="orange">{tv(vehicle.vehicle_type)}</Badge>
            </div>
            <p className="text-slate-500 mt-1">{vehicle.model}</p>
          </div>
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

        <div className="mt-6 max-w-sm">
          <FuelGauge level={vehicle.fuel_level} reportedAt={vehicle.fuel_reported_at} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-3">{tr("ui.recent_trips")} ({vTrips.length})</h2>
          {vTrips.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">{tr("ui.no_trips_recorded")}</p> : (
            <div className="space-y-2">
              {vTrips.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{t.origin} → {t.destination}</span>
                  <span className="text-sm font-semibold text-slate-800">{currency(t.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-3">{tr("ui.expenses")} ({vExpenses.length})</h2>
          {vExpenses.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">{tr("ui.no_expenses_recorded")}</p> : (
            <div className="space-y-2">
              {vExpenses.slice(0, 6).map((x) => (
                <div key={x.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{tv(x.category)} · {new Date(x.date).toLocaleDateString()}</span>
                  <span className="text-sm font-semibold text-slate-800">{currency(x.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
