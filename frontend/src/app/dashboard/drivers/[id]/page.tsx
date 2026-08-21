"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, Phone, Mail, Route as RouteIcon, IdCard,
  Truck, Calendar, CheckCircle, Navigation, XCircle, KeyRound, WifiOff,
} from "lucide-react";
import { useDrivers, useTrips } from "@/lib/api-data";
import { Badge, EmptyState } from "@/components/ui";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

const statusTone: Record<string, string> = { Active: "green", "On Trip": "blue", Offline: "amber", Inactive: "gray" };

export default function DriverDetail() {
  const tr = useT();
  const tv = useTValue();
  const { currency, distance } = useUnits();
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { data: drivers } = useDrivers();
  const { data: trips } = useTrips();

  const driver = useMemo(() => drivers.find((d) => d.id === id), [drivers, id]);
  const dTrips = useMemo(() => (driver ? trips.filter((t) => t.driver_ref === driver.id) : []), [trips, driver]);

  if (!driver) {
    return <div className="card"><EmptyState icon={Users} title={tr("ui.driver_not_found")} action={<Link href="/dashboard/drivers" className="btn btn-primary mx-auto">{tr("ui.back_to_drivers")}</Link>} /></div>;
  }

  const specs = [
    { icon: Phone, label: tr("ui.mobile"), value: driver.mobile },
    { icon: Mail, label: tr("ui.email"), value: driver.email || "—" },
    { icon: IdCard, label: tr("ui.license"), value: driver.license_no || "—" },
    { icon: Truck, label: tr("ui.vehicle"), value: driver.plate_number || tr("ui.unassigned") },
    { icon: RouteIcon, label: tr("ui.total_trips"), value: driver.total_trips },
    { icon: Calendar, label: tr("ui.joined"), value: new Date(driver.joined_at).toLocaleDateString() },
  ];
  const SIcon = driver.status === "Active" ? CheckCircle : driver.status === "On Trip" ? Navigation : driver.status === "Offline" ? WifiOff : XCircle;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost"><ArrowLeft className="w-4 h-4" /> {tr("ui.back")}</button>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 text-white text-3xl font-bold flex items-center justify-center shadow-brand">
            {driver.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900">{driver.full_name}</h1>
              <Badge tone={statusTone[driver.status] || "gray"} icon={SIcon}>{tv(driver.status)}</Badge>
              {driver.activated ? (
                <Badge tone="green" icon={CheckCircle}>{tr("ui.activated")}</Badge>
              ) : (
                <Badge tone="amber" icon={KeyRound}>{tr("ui.not_activated")}</Badge>
              )}
            </div>
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
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-3">{tr("ui.trip_history")} ({dTrips.length})</h2>
        {dTrips.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">{tr("ui.no_trips_recorded_for_this_driver")}</p> : (
          <div className="space-y-2">
            {dTrips.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{t.origin} → {t.destination}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{distance(t.distance)}</span>
                  <span className="text-sm font-semibold text-slate-800">{currency(t.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
