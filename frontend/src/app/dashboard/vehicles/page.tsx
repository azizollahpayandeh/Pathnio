"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car, Search, Plus, Eye, User, Weight, Palette, Truck, Wrench,
  CheckCircle, XCircle, Trash2, UserCheck,
} from "lucide-react";
import AddVehicleModal, { VehicleInput } from "@/components/AddVehicleModal";
import AssignVehicleModal from "@/components/AssignVehicleModal";
import { PageHeader, StatCard, Badge, EmptyState , CardGridSkeleton} from "@/components/ui";
import { useVehicles, useDrivers, createVehicle, deleteVehicle } from "@/lib/api-data";
import { toast } from "@/components/Toast";
import { useT, useTValue } from "@/i18n";

const statusTone: Record<string, string> = { Active: "green", Inactive: "gray", Maintenance: "blue" };
const statusIcon: Record<string, typeof CheckCircle> = { Active: CheckCircle, Inactive: XCircle, Maintenance: Wrench };

export default function VehiclesPage() {
  const tr = useT();
  const tv = useTValue();
  const { data: vehicles, ready, refetch } = useVehicles();
  const { data: allDrivers } = useDrivers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [assignFor, setAssignFor] = useState<
    { id: string; plate: string; driverId?: string | null } | null
  >(null);

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

  // Throws on failure so the modal can surface a friendly error and stay open.
  const addVehicle = async (v: VehicleInput) => {
    await createVehicle(v as unknown as Record<string, unknown>);
    await refetch();
  };

  const handleDelete = async (id: string, plate: string) => {
    if (typeof window !== "undefined" && !window.confirm(tr("ui.confirm_delete_vehicle", { plate }))) return;
    try {
      await deleteVehicle(id);
      await refetch();
      toast.success(tr("ui.vehicle_deleted", { plate }));
    } catch (err) {
      toast.fromError(err, tr("ui.could_not_delete_the_vehicle"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Car}
        title={tr("ui.vehicles")}
        subtitle={tr("ui.monitor_and_manage_your_fleet")}
        gradient="from-orange-500 to-amber-600"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> {tr("ui.add_vehicle")}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Car} label={tr("ui.total_vehicles")} value={stats.total} gradient="from-orange-500 to-amber-600" />
        <StatCard icon={CheckCircle} label={tr("ui.active")} value={stats.active} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={XCircle} label={tr("ui.inactive")} value={stats.inactive} gradient="from-slate-400 to-slate-600" />
        <StatCard icon={Wrench} label={tr("ui.maintenance")} value={stats.maintenance} gradient="from-violet-500 to-purple-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_plate_model_driver")} className="field ps-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field sm:w-44">
          <option value="all">{tr("ui.all_status")}</option>
          <option value="Active">{tv("Active")}</option><option value="Inactive">{tv("Inactive")}</option><option value="Maintenance">{tv("Maintenance")}</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="field sm:w-40">
          <option value="all">{tr("ui.all_types")}</option>
          <option value="Truck">{tv("Truck")}</option><option value="Van">{tv("Van")}</option><option value="Sedan">{tv("Sedan")}</option><option value="Pickup">{tv("Pickup")}</option>
        </select>
      </div>

      {!ready ? (
        <CardGridSkeleton count={4} cols="xl:grid-cols-2" />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Car}
            title={tr("ui.no_vehicles_found")}
            description={tr("ui.try_adjusting_your_filters_or_add_a_new_vehicle_t")}
            action={<button onClick={() => setShowAdd(true)} className="btn btn-primary mx-auto"><Plus className="w-4 h-4" /> {tr("ui.add_vehicle")}</button>}
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
                      <Badge tone={statusTone[v.status]} icon={SIcon}>{tv(v.status)}</Badge>
                      <Badge tone="orange">{tv(v.vehicle_type)}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">{v.model}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 truncate"><User className="w-4 h-4 text-slate-400" />{v.driver || tr("ui.unassigned")}</span>
                      <span className="flex items-center gap-1.5"><Weight className="w-4 h-4 text-slate-400" />{v.capacity || "—"}</span>
                      <span className="flex items-center gap-1.5"><Palette className="w-4 h-4 text-slate-400" />{v.color || "—"}</span>
                      <span className="flex items-center gap-1.5 truncate"><Truck className="w-4 h-4 text-slate-400" />{tv(v.vehicle_type)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/dashboard/vehicles/${encodeURIComponent(v.plate_number)}`} className="btn btn-ghost flex-1 text-sm">
                    <Eye className="w-4 h-4" /> {tr("ui.view_details")}
                  </Link>
                  <button
                    onClick={() => setAssignFor({ id: v.id, plate: v.plate_number, driverId: v.assignedDriverId })}
                    className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition"
                    aria-label={tr("ui.assign_driver")}
                    title={tr("ui.assign_change_driver")}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.plate_number)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    aria-label={tr("ui.delete")}
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

      {assignFor && (
        <AssignVehicleModal
          isOpen={!!assignFor}
          onClose={() => setAssignFor(null)}
          vehicleId={assignFor.id}
          vehiclePlate={assignFor.plate}
          currentDriverId={assignFor.driverId}
          drivers={allDrivers}
          onChanged={refetch}
        />
      )}
    </div>
  );
}
