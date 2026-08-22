"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users, Search, Plus, Eye, Phone, Trash2, Route,
  CheckCircle, Navigation, KeyRound, WifiOff,
} from "lucide-react";
import AddDriverModal, { DriverInput } from "@/components/AddDriverModal";
import InviteDriverModal from "@/components/InviteDriverModal";
import { PageHeader, StatCard, Badge, EmptyState , CardGridSkeleton} from "@/components/ui";
import { useDrivers, createDriver, deleteDriver, createInvitation } from "@/lib/api-data";
import { toast } from "@/components/Toast";
import { useT, useTValue } from "@/i18n";

const statusTone: Record<string, string> = { Active: "green", "On Trip": "blue", Offline: "amber", Inactive: "gray" };

export default function DriversPage() {
  const tr = useT();
  const tv = useTValue();
  const { data: drivers, ready, refetch } = useDrivers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [invite, setInvite] = useState<{ id: string; name: string; token?: string } | null>(null);

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
    activated: drivers.filter((d) => d.activated).length,
  };

  // Throws on failure so the modal can surface a friendly error and stay open.
  const addDriver = async (d: DriverInput) => {
    const created = await createDriver({
      full_name: d.full_name,
      mobile: d.mobile,
      email: d.email,
      plate_number: d.plate_number,
      vehicle_type: d.vehicle_type,
    });
    // Immediately mint an activation code and show it to the owner.
    try {
      const { token } = await createInvitation(created.id);
      setInvite({ id: created.id, name: created.full_name, token });
    } catch {
      /* driver still created; owner can invite from the card */
    }
    await refetch();
  };

  const handleDelete = async (id: string, name: string) => {
    if (typeof window !== "undefined" && !window.confirm(tr("ui.confirm_delete_driver", { name }))) return;
    try {
      await deleteDriver(id);
      await refetch();
      toast.success(tr("ui.driver_deleted", { name }));
    } catch (err) {
      toast.fromError(err, tr("ui.could_not_delete_the_driver"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Users}
        title={tr("ui.drivers")}
        subtitle={tr("ui.your_team_on_the_road")}
        gradient="from-purple-500 to-violet-600"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> {tr("ui.add_driver")}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Users} label={tr("ui.total_drivers")} value={stats.total} gradient="from-purple-500 to-violet-600" />
        <StatCard icon={CheckCircle} label={tr("ui.available")} value={stats.active} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={Navigation} label={tr("ui.on_trip")} value={stats.onTrip} gradient="from-purple-500 to-fuchsia-600" />
        <StatCard icon={KeyRound} label={tr("ui.activated")} value={stats.activated} gradient="from-amber-500 to-orange-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_name_plate_phone")} className="field ps-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field sm:w-44">
          <option value="all">{tr("ui.all_status")}</option>
          <option value="Active">{tv("Active")}</option><option value="On Trip">{tv("On Trip")}</option><option value="Offline">{tv("Offline")}</option><option value="Inactive">{tv("Inactive")}</option>
        </select>
      </div>

      {!ready ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={tr("ui.no_drivers_found")}
            description={tr("ui.add_drivers_to_start_assigning_vehicles_and_trips")}
            action={<button onClick={() => setShowAdd(true)} className="btn btn-primary mx-auto"><Plus className="w-4 h-4" /> {tr("ui.add_driver")}</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filtered.map((d) => {
            return (
              <div key={d.id} className="card card-hover p-5">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {d.full_name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{d.full_name}</h3>
                    <Badge
                      tone={statusTone[d.status] || "gray"}
                      icon={d.status === "On Trip" ? Navigation : d.status === "Active" ? CheckCircle : WifiOff}
                    >
                      {tv(d.status)}
                    </Badge>
                  </div>
                  {d.activated ? (
                    <Badge tone="green" icon={CheckCircle}>{tr("ui.activated")}</Badge>
                  ) : (
                    <Badge tone="amber" icon={KeyRound}>{tr("ui.not_activated")}</Badge>
                  )}
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{d.mobile}</span>
                  <span className="flex items-center gap-2"><Route className="w-4 h-4 text-slate-400" />{tr("drivers.trips", { count: d.total_trips })} · {d.plate_number || tr("ui.no_vehicle")}</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/dashboard/drivers/${d.id}`} className="btn btn-ghost flex-1 text-sm">
                    <Eye className="w-4 h-4" /> {tr("ui.profile")}
                  </Link>
                  {!d.activated && (
                    <button
                      onClick={() => setInvite({ id: d.id, name: d.full_name })}
                      className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 hover:bg-violet-100 transition"
                      aria-label={tr("ui.invite")}
                      title={tr("ui.invite_activation_code")}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(d.id, d.full_name)}
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

      <AddDriverModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAddDriver={addDriver} />

      {invite && (
        <InviteDriverModal
          isOpen={!!invite}
          onClose={() => setInvite(null)}
          driverId={invite.id}
          driverName={invite.name}
          initialToken={invite.token}
          onChanged={refetch}
        />
      )}
    </div>
  );
}
