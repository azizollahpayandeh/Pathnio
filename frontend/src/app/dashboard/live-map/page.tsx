"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Map as MapIcon, Navigation, Signal, Search } from "lucide-react";
import { PageHeader, Badge } from "@/components/ui";
import { useLiveVehicles, type LiveVehicle } from "@/lib/api-data";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

const LiveMap = dynamic(() => import("@/components/LiveMapWidget"), { ssr: false });

function bucket(v: LiveVehicle): "moving" | "stopped" | "offline" {
  if (v.live_status === "MOVING") return "moving";
  if (v.live_status === "STOPPED") return "stopped";
  return "offline";
}
const tone: Record<string, string> = { moving: "green", stopped: "amber", offline: "gray" };

export default function LiveMapPage() {
  const tr = useT();
  const tv = useTValue();
  const { speed } = useUnits();
  const { data: vehicles } = useLiveVehicles();
  const [search, setSearch] = useState("");

  const list = vehicles.filter(
    (v) =>
      v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      (v.driver?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={MapIcon} title={tr("ui.live_map")} subtitle={tr("ui.real_time_fleet_positions")} gradient="from-emerald-500 to-teal-600" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <div className="h-[520px]">
            <LiveMap />
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-3">{tr("ui.fleet_count")} ({list.length})</h2>
          <div className="relative mb-3">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_vehicle")} className="field ps-10" />
          </div>
          <div className="space-y-2 overflow-y-auto scroll-slim max-h-[420px] pr-1">
            {list.length === 0 && (
              <p className="text-sm text-slate-400">{tr("ui.no_vehicles_yet_hint")}</p>
            )}
            {list.map((v) => {
              const st = bucket(v);
              return (
                <div key={v.id} className="p-3 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-soft transition bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{v.plate_number}</span>
                    <Badge tone={tone[st]}>{tv(st)}</Badge>
                  </div>
                  <div className="text-sm text-slate-500 mt-1 truncate">{v.driver?.full_name || tr("ui.unassigned")}{v.model ? ` · ${v.model}` : ""}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /><span className="ltr-inline">{speed(v.speed)}</span></span>
                    <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" />{st === "offline" ? tr("ui.no_signal") : tr("ui.online_lbl")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
