"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, Phone, Mail, Star, Route as RouteIcon, IdCard,
  Truck, Calendar, CheckCircle, Navigation, XCircle,
} from "lucide-react";
import { useCollection } from "@/lib/store";
import { Badge, EmptyState } from "@/components/ui";

const statusTone: Record<string, string> = { Active: "green", "On Trip": "blue", Inactive: "gray" };
const currency = (n: number) => "€" + n.toLocaleString();

export default function DriverDetail() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [drivers] = useCollection("drivers");
  const [trips] = useCollection("trips");

  const driver = useMemo(() => drivers.find((d) => d.id === id), [drivers, id]);
  const dTrips = useMemo(() => (driver ? trips.filter((t) => t.driver === driver.full_name) : []), [trips, driver]);

  if (!driver) {
    return <div className="card"><EmptyState icon={Users} title="Driver not found" action={<Link href="/dashboard/drivers" className="btn btn-primary mx-auto">Back to drivers</Link>} /></div>;
  }

  const specs = [
    { icon: Phone, label: "Mobile", value: driver.mobile },
    { icon: Mail, label: "Email", value: driver.email || "—" },
    { icon: IdCard, label: "License", value: driver.license_no || "—" },
    { icon: Truck, label: "Vehicle", value: driver.plate_number || "Unassigned" },
    { icon: RouteIcon, label: "Total trips", value: driver.total_trips },
    { icon: Calendar, label: "Joined", value: new Date(driver.joined_at).toLocaleDateString() },
  ];
  const SIcon = driver.status === "Active" ? CheckCircle : driver.status === "On Trip" ? Navigation : XCircle;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 text-white text-3xl font-bold flex items-center justify-center shadow-brand">
            {driver.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900">{driver.full_name}</h1>
              <Badge tone={statusTone[driver.status]} icon={SIcon}>{driver.status}</Badge>
            </div>
            <p className="text-amber-500 mt-1 flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400" /> {driver.rating.toFixed(1)} rating</p>
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
        <h2 className="font-bold text-slate-800 mb-3">Trip history ({dTrips.length})</h2>
        {dTrips.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">No trips recorded for this driver.</p> : (
          <div className="space-y-2">
            {dTrips.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{t.origin} → {t.destination}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{t.distance} km</span>
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
