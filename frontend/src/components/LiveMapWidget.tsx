"use client";
import { useEffect, useState, useMemo } from "react";
import { FaCarSide, FaCheckCircle, FaRegClock, FaTimesCircle } from "react-icons/fa";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import { useCollection } from "@/lib/store";
import type { Vehicle } from "@/lib/types";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), { ssr: false });

type LiveStatus = "moving" | "stopped" | "offline";

function liveStatus(v: Vehicle): LiveStatus {
  if (v.status !== "Active") return "offline";
  return v.speed > 0 ? "moving" : "stopped";
}

const statusLabel: Record<LiveStatus, string> = {
  moving: "Moving",
  stopped: "Stopped",
  offline: "Offline",
};

interface LiveMapWidgetProps {
  fullscreen?: boolean;
}

export default function LiveMapWidget({ fullscreen = false }: LiveMapWidgetProps) {
  const [isClient, setIsClient] = useState(false);
  const [statusIcons, setStatusIcons] = useState<Record<string, unknown>>({});
  const [vehicles] = useCollection("vehicles");

  const center = useMemo<LatLngExpression>(() => {
    if (!vehicles.length) return [52.52, 13.405];
    const lat = vehicles.reduce((s, v) => s + v.lat, 0) / vehicles.length;
    const lng = vehicles.reduce((s, v) => s + v.lng, 0) / vehicles.length;
    return [lat, lng];
  }, [vehicles]);

  const counts = useMemo(() => {
    const c = { moving: 0, stopped: 0, offline: 0 };
    vehicles.forEach((v) => (c[liveStatus(v)] += 1));
    return c;
  }, [vehicles]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    import("leaflet").then((L) => {
      const mk = (url: string) =>
        L.icon({ iconUrl: url, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -32] });
      setStatusIcons({
        moving: mk("https://cdn-icons-png.flaticon.com/512/854/854894.png"),
        stopped: mk("https://cdn-icons-png.flaticon.com/512/854/854866.png"),
        offline: mk("https://cdn-icons-png.flaticon.com/512/854/854878.png"),
      });
    });
  }, [isClient]);

  const height = fullscreen ? "100%" : "100%";

  if (!isClient || Object.keys(statusIcons).length === 0) {
    return (
      <div className="w-full h-full min-h-[320px] bg-violet-50 rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-violet-500">
          <div className="w-9 h-9 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <span className="font-medium">Loading map…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[320px] relative rounded-2xl overflow-hidden">
      {/* Counters */}
      <div className="absolute top-3 left-3 z-[1000] card px-4 py-2.5 flex flex-wrap gap-x-5 gap-y-1 items-center text-sm shadow-soft">
        <span className="font-bold text-violet-700 flex items-center gap-1.5"><FaCarSide className="text-violet-400" />{vehicles.length} total</span>
        <span className="font-semibold text-emerald-600 flex items-center gap-1"><FaCheckCircle />{counts.moving} moving</span>
        <span className="font-semibold text-amber-600 flex items-center gap-1"><FaRegClock />{counts.stopped} stopped</span>
        <span className="font-semibold text-rose-600 flex items-center gap-1"><FaTimesCircle />{counts.offline} offline</span>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vehicles.map((v) => {
          const st = liveStatus(v);
          return (
            <Marker key={v.id} position={[v.lat, v.lng] as LatLngExpression} icon={statusIcons[st] as never}>
              <Popup>
                <div className="font-bold text-violet-800 text-base mb-1">{v.model}</div>
                <div className="text-slate-600 mb-0.5">Driver: <span className="font-semibold">{v.driver}</span></div>
                <div className="text-slate-600 mb-0.5">Plate: <span className="font-mono">{v.plate_number}</span></div>
                <div className="mb-0.5">Status: <span className="font-semibold">{statusLabel[st]}</span></div>
                <div>Speed: <span className="font-mono text-violet-700">{v.speed} km/h</span></div>
              </Popup>
              <Tooltip direction="top" offset={[0, -22]} opacity={0.95}>
                {v.plate_number} · {v.driver}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
