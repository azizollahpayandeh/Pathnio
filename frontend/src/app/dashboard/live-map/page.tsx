"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Map as MapIcon, Navigation, Signal, Fuel, Search } from "lucide-react";
import { PageHeader, Badge } from "@/components/ui";
import { useCollection } from "@/lib/store";
import type { Vehicle } from "@/lib/types";

const LiveMap = dynamic(() => import("@/components/LiveMapWidget"), { ssr: false });

function liveStatus(v: Vehicle): "moving" | "stopped" | "offline" {
  if (v.status !== "Active") return "offline";
  return v.speed > 0 ? "moving" : "stopped";
}
const tone: Record<string, string> = { moving: "green", stopped: "amber", offline: "gray" };

export default function LiveMapPage() {
  const [vehicles] = useCollection("vehicles");
  const [search, setSearch] = useState("");

  const list = vehicles.filter(
    (v) => v.plate_number.toLowerCase().includes(search.toLowerCase()) || v.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={MapIcon} title="Live Map" subtitle="Real-time fleet positions" gradient="from-emerald-500 to-teal-600" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <div className="h-[520px]">
            <LiveMap />
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-3">Fleet ({list.length})</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicle…" className="field pl-10" />
          </div>
          <div className="space-y-2 overflow-y-auto scroll-slim max-h-[420px] pr-1">
            {list.map((v) => {
              const st = liveStatus(v);
              return (
                <div key={v.id} className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-soft transition bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{v.plate_number}</span>
                    <Badge tone={tone[st]}>{st}</Badge>
                  </div>
                  <div className="text-sm text-slate-500 mt-1 truncate">{v.driver} · {v.model}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" />{v.speed} km/h</span>
                    <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{v.fuel_level}%</span>
                    <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" />{st === "offline" ? "No signal" : "Online"}</span>
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
