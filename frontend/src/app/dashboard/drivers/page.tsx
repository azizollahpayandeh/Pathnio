"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users, Search, Plus, Eye, Phone, Star, Trash2, Route,
  CheckCircle, XCircle, Navigation,
} from "lucide-react";
import AddDriverModal, { NewDriver } from "@/components/AddDriverModal";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import { useCollection, insert, remove, uid } from "@/lib/store";
import type { Driver } from "@/lib/types";

const statusTone: Record<string, string> = { Active: "green", "On Trip": "blue", Inactive: "gray" };
const statusIcon: Record<string, typeof CheckCircle> = { Active: CheckCircle, "On Trip": Navigation, Inactive: XCircle };

export default function DriversPage() {
  const [drivers] = useCollection("drivers");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () =>
      drivers.filter(
        (d) =>
          (d.full_name.toLowerCase().includes(search.toLowerCase()) ||
            d.plate_number.toLowerCase().includes(search.toLowerCase()) ||
            d.mobile.includes(search)) &&
          (status === "all" || d.status === status)
      ),
    [drivers, search, status]
  );

  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "Active").length,
    onTrip: drivers.filter((d) => d.status === "On Trip").length,
    avgRating: drivers.length
      ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length).toFixed(1)
      : "0.0",
  };

  const addDriver = (d: NewDriver) =>
    insert("drivers", { ...d, id: uid("drv"), createdAt: new Date().toISOString() } as Driver);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Users}
        title="Drivers"
        subtitle="Your team on the road"
        gradient="from-purple-500 to-violet-600"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Users} label="Total Drivers" value={stats.total} gradient="from-purple-500 to-violet-600" />
        <StatCard icon={CheckCircle} label="Available" value={stats.active} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={Navigation} label="On Trip" value={stats.onTrip} gradient="from-purple-500 to-fuchsia-600" />
        <StatCard icon={Star} label="Avg. Rating" value={stats.avgRating} gradient="from-amber-500 to-orange-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, plate, phone…" className="field pl-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field sm:w-44">
          <option value="all">All Status</option>
          <option>Active</option><option>On Trip</option><option>Inactive</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No drivers found"
            description="Add drivers to start assigning vehicles and trips."
            action={<button onClick={() => setShowAdd(true)} className="btn btn-primary mx-auto"><Plus className="w-4 h-4" /> Add Driver</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filtered.map((d) => {
            const SIcon = statusIcon[d.status] || CheckCircle;
            return (
              <div key={d.id} className="card card-hover p-5">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {d.full_name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{d.full_name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {d.rating.toFixed(1)}
                    </div>
                  </div>
                  <Badge tone={statusTone[d.status]} icon={SIcon}>{d.status}</Badge>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{d.mobile}</span>
                  <span className="flex items-center gap-2"><Route className="w-4 h-4 text-slate-400" />{d.total_trips} trips · {d.plate_number || "no vehicle"}</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/dashboard/drivers/${d.id}`} className="btn btn-ghost flex-1 text-sm">
                    <Eye className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={() => remove("drivers", d.id)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddDriverModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAddDriver={addDriver} />
    </div>
  );
}
