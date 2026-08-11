"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car, Search, Plus, Eye, User, Weight, Palette, Truck, Wrench,
  CheckCircle, XCircle, Trash2, Fuel, Gauge,
} from "lucide-react";
import AddVehicleModal, { NewVehicle } from "@/components/AddVehicleModal";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import { useVehicles, createVehicle, deleteVehicle } from "@/lib/api-data";

const statusTone: Record<string, string> = { Active: "green", Inactive: "gray", Maintenance: "blue" };
const statusIcon: Record<string, typeof CheckCircle> = { Active: CheckCircle, Inactive: XCircle, Maintenance: Wrench };

export default function VehiclesPage() {
  const { data: vehicles, refetch } = useVehicles();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
            v.model.toLowerCase().includes(search.toLowerCase()) ||
            v.driver.toLowerCase().includes(search.toLowerCase())) &&
          (status === "all" || v.status === status) &&
          (type === "all" || v.vehicle_type === type)
      ),
    [vehicles, search, status, type]
  );

  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "Active").length,
    inactive: vehicles.filter((v) => v.status === "Inactive").length,
    maintenance: vehicles.filter((v) => v.status === "Maintenance").length,
  };

  const addVehicle = async (v: NewVehicle) => {
    await createVehicle(v as unknown as Record<string, unknown>);
    await refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteVehicle(id);
    await refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Car}
        title="Vehicles"
        subtitle="Monitor and manage your fleet"
        gradient="from-orange-500 to-amber-600"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Car} label="Total Vehicles" value={stats.total} gradient="from-orange-500 to-amber-600" />
        <StatCard icon={CheckCircle} label="Active" value={stats.active} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={XCircle} label="Inactive" value={stats.inactive} gradient="from-slate-400 to-slate-600" />
        <StatCard icon={Wrench} label="Maintenance" value={stats.maintenance} gradient="from-violet-500 to-purple-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plate, model, driver…" className="field pl-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field sm:w-44">
          <option value="all">All Status</option>
          <option>Active</option><option>Inactive</option><option>Maintenance</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="field sm:w-40">
          <option value="all">All Types</option>
          <option>Truck</option><option>Van</option><option>Sedan</option><option>Pickup</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Car}
            title="No vehicles found"
            description="Try adjusting your filters, or add a new vehicle to your fleet."
            action={<button onClick={() => setShowAdd(true)} className="btn btn-primary mx-auto"><Plus className="w-4 h-4" /> Add Vehicle</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 stagger">
          {filtered.map((v) => {
            const SIcon = statusIcon[v.status] || CheckCircle;
            return (
              <div key={v.id} className="card card-hover p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <Truck className="w-7 h-7 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{v.plate_number}</h3>
                      <Badge tone={statusTone[v.status]} icon={SIcon}>{v.status}</Badge>
                      <Badge tone="orange">{v.vehicle_type}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">{v.model}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 truncate"><User className="w-4 h-4 text-slate-400" />{v.driver || "Unassigned"}</span>
                      <span className="flex items-center gap-1.5"><Weight className="w-4 h-4 text-slate-400" />{v.capacity || "—"}</span>
                      <span className="flex items-center gap-1.5"><Palette className="w-4 h-4 text-slate-400" />{v.color}</span>
                      <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4 text-slate-400" />{v.odometer.toLocaleString()} km</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" /> Fuel</span>
                        <span className="font-semibold">{v.fuel_level}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${v.fuel_level < 20 ? "bg-rose-500" : v.fuel_level < 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${v.fuel_level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/dashboard/vehicles/${encodeURIComponent(v.plate_number)}`} className="btn btn-ghost flex-1 text-sm">
                    <Eye className="w-4 h-4" /> View details
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id)}
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

      <AddVehicleModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAddVehicle={addVehicle} />
    </div>
  );
}
