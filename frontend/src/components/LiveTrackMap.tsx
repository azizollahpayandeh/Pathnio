"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), { ssr: false });

export type LiveVehicle = {
  id: number;
  plate_number: string;
  model?: string;
  driver?: string;
  status?: string;
  lat: number;
  lng: number;
  speed: number;
};

type LiveStatus = "moving" | "stopped" | "offline";

function liveStatus(v: LiveVehicle): LiveStatus {
  if (v.status && v.status !== "Active") return "offline";
  return v.speed > 0 ? "moving" : "stopped";
}

// Fit the map to the markers once, on first data — then leave the user alone.
function FitOnce({ vehicles }: { vehicles: LiveVehicle[] }) {
  const done = useRef(false);
  const [useMapHook, setHook] = useState<any>(null);
  useEffect(() => {
    import("react-leaflet").then((m) => setHook(() => m.useMap));
  }, []);
  return useMapHook ? <FitOnceInner useMap={useMapHook} vehicles={vehicles} done={done} /> : null;
}

function FitOnceInner({ useMap, vehicles, done }: any) {
  const map = useMap();
  useEffect(() => {
    if (done.current || vehicles.length === 0) return;
    done.current = true;
    if (vehicles.length === 1) {
      map.setView([vehicles[0].lat, vehicles[0].lng], 14);
    } else {
      import("leaflet").then((L) => {
        const bounds = L.latLngBounds(vehicles.map((v: LiveVehicle) => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      });
    }
  }, [vehicles, map, done]);
  return null;
}

export default function LiveTrackMap({ vehicles }: { vehicles: LiveVehicle[] }) {
  const [isClient, setIsClient] = useState(false);
  const [icons, setIcons] = useState<Record<string, unknown>>({});

  const center = useMemo<LatLngExpression>(() => {
    if (!vehicles.length) return [52.52, 13.405];
    const lat = vehicles.reduce((s, v) => s + v.lat, 0) / vehicles.length;
    const lng = vehicles.reduce((s, v) => s + v.lng, 0) / vehicles.length;
    return [lat, lng];
  }, [vehicles]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    import("leaflet").then((L) => {
      const mk = (url: string) =>
        L.icon({ iconUrl: url, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -32] });
      setIcons({
        moving: mk("https://cdn-icons-png.flaticon.com/512/854/854894.png"),
        stopped: mk("https://cdn-icons-png.flaticon.com/512/854/854866.png"),
        offline: mk("https://cdn-icons-png.flaticon.com/512/854/854878.png"),
      });
    });
  }, [isClient]);

  if (!isClient || Object.keys(icons).length === 0) {
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
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitOnce vehicles={vehicles} />
        {vehicles.map((v) => {
          const st = liveStatus(v);
          return (
            <Marker key={v.id} position={[v.lat, v.lng] as LatLngExpression} icon={icons[st] as never}>
              <Popup>
                <div className="font-bold text-violet-800 text-base mb-1">{v.model || v.plate_number}</div>
                <div className="text-slate-600 mb-0.5">Driver: <span className="font-semibold">{v.driver || "—"}</span></div>
                <div className="text-slate-600 mb-0.5">Plate: <span className="font-mono">{v.plate_number}</span></div>
                <div>Speed: <span className="font-mono text-violet-700">{v.speed} km/h</span></div>
              </Popup>
              <Tooltip direction="top" offset={[0, -22]} opacity={0.95}>
                {v.plate_number} · {v.speed} km/h
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
