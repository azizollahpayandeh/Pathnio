"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Truck, User, Palette, Weight, Fuel, Gauge, Route as RouteIcon,
  Wrench, CheckCircle, XCircle, Calendar,
} from "lucide-react";
import { useCollection } from "@/lib/store";
import { Badge, EmptyState } from "@/components/ui";

const statusTone: Record<string, string> = { Active: "green", Inactive: "gray", Maintenance: "blue" };
const currency = (n: number) => "€" + n.toLocaleString();

export default function VehicleDetail() {
  const params = useParams();
  const router = useRouter();
  const plate = decodeURIComponent(String(params.id));
  const [vehicles] = useCollection("vehicles");
  const [trips] = useCollection("trips");
  const [expenses] = useCollection("expenses");

  const vehicle = useMemo(() => vehicles.find((v) => v.plate_number === plate), [vehicles, plate]);
  const vTrips = useMemo(() => trips.filter((t) => t.plate_number === plate), [trips, plate]);
  const vExpenses = useMemo(() => expenses.filter((e) => e.plate_number === plate), [expenses, plate]);

  if (!vehicle) {
    return (
      <div className="card"><EmptyState icon={Truck} title="Vehicle not found" description={`No vehicle with plate ${plate}.`} action={<Link href="/dashboard/vehicles" className="btn btn-primary mx-auto">Back to vehicles</Link>} /></div>
    );
  }

  const specs = [
    { icon: User, label: "Driver", value: vehicle.driver || "Unassigned" },
    { icon: Weight, label: "Capacity", value: vehicle.capacity || "—" },
    { icon: Palette, label: "Color", value: vehicle.color },
    { icon: Gauge, label: "Odometer", value: `${vehicle.odometer.toLocaleString()} km` },
    { icon: Fuel, label: "Efficiency", value: vehicle.efficiency },
    { icon: RouteIcon, label: "Total trips", value: vehicle.total_trips },
    { icon: Wrench, label: "Last service", value: new Date(vehicle.last_maintenance).toLocaleDateString() },
    { icon: Calendar, label: "Added", value: new Date(vehicle.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-brand">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900">{vehicle.plate_number}</h1>
              <Badge tone={statusTone[vehicle.status]} icon={vehicle.status === "Active" ? CheckCircle : vehicle.status === "Maintenance" ? Wrench : XCircle}>{vehicle.status}</Badge>
              <Badge tone="orange">{vehicle.vehicle_type}</Badge>
            </div>
            <p className="text-slate-500 mt-1">{vehicle.model} · {vehicle.company}</p>
          </div>
          <div className="text-center px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className={`text-2xl font-bold ${vehicle.fuel_level < 20 ? "text-rose-600" : "text-emerald-600"}`}>{vehicle.fuel_level}%</div>
            <div className="text-xs text-slate-500">Fuel</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {specs.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <s.icon className="w-5 h-5 text-slate-400 mb-2" />
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="font-semibold text-slate-800 truncate">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-3">Recent trips ({vTrips.length})</h2>
          {vTrips.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">No trips recorded.</p> : (
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
          <h2 className="font-bold text-slate-800 mb-3">Expenses ({vExpenses.length})</h2>
          {vExpenses.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">No expenses recorded.</p> : (
            <div className="space-y-2">
              {vExpenses.slice(0, 6).map((x) => (
                <div key={x.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{x.category} · {new Date(x.date).toLocaleDateString()}</span>
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
