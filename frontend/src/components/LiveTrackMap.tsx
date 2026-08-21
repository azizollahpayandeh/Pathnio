"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import type { LiveVehicle } from "@/lib/api-data";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

export type { LiveVehicle } from "@/lib/api-data";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), { ssr: false });

// live_status -> marker bucket (icons only cover moving/stopped/offline)
function bucket(v: LiveVehicle): "moving" | "stopped" | "offline" {
  if (v.live_status === "MOVING") return "moving";
  if (v.live_status === "STOPPED") return "stopped";
  return "offline";
}

/**
 * A vehicle is mappable ONLY when the backend reported a real GPS position.
 * Vehicles that have never sent telemetry have lat/lng === null and are never
 * drawn (this is what previously placed a marker at 0,0 in the ocean).
 */
export function hasRealPosition(
  v: LiveVehicle
): v is LiveVehicle & { lat: number; lng: number } {
  if (v.has_valid_position === false) return false;
  if (typeof v.lat !== "number" || typeof v.lng !== "number") return false;
  if (v.lat === 0 && v.lng === 0) return false;
  return Math.abs(v.lat) <= 90 && Math.abs(v.lng) <= 180 && !!v.last_seen_at;
}

function whenSeen(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

// Fit to markers once; then pan to a focused vehicle when it changes.
function MapController({ vehicles, focusId }: { vehicles: LiveVehicle[]; focusId?: number | null }) {
  const [useMapHook, setHook] = useState<any>(null);
  useEffect(() => { import("react-leaflet").then((m) => setHook(() => m.useMap)); }, []);
  return useMapHook ? <Inner useMap={useMapHook} vehicles={vehicles} focusId={focusId} /> : null;
}
function Inner({ useMap, vehicles, focusId }: any) {
  const map = useMap();
  const fitted = useRef(false);

  // Leaflet measures its container on init. Inside a flex/grid card the final
  // size often arrives a frame later, leaving the tile pane at 0x0 — the map
  // then renders in a small band with grey gutters and zoom/pan misbehave.
  // Re-measure on mount and whenever the container resizes.
  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false });
    fix();
    const raf = requestAnimationFrame(fix);
    const t = setTimeout(fix, 300);
    const ro = new ResizeObserver(fix);
    const el = map.getContainer?.();
    if (el) ro.observe(el);
    window.addEventListener("resize", fix);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", fix);
    };
  }, [map]);

  // Fit to the real fleet exactly ONCE, when the first real positions arrive.
  // The viewport is never locked afterwards: the user keeps full world zoom
  // and pan (an earlier max-bounds/min-zoom clamp trapped them in one region).
  useEffect(() => {
    if (fitted.current || vehicles.length === 0) return;
    fitted.current = true;
    import("leaflet").then((L) => {
      if (vehicles.length === 1) {
        map.setView([vehicles[0].lat, vehicles[0].lng], 13, { animate: true });
      } else {
        const bounds = L.latLngBounds(
          vehicles.map((v: LiveVehicle) => [v.lat, v.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    });
  }, [vehicles, map]);

  useEffect(() => {
    if (!focusId) return;
    const v = vehicles.find((x: LiveVehicle) => x.id === focusId);
    if (v) map.setView([v.lat, v.lng], 15, { animate: true });
  }, [focusId, vehicles, map]);

  return null;
}



export default function LiveTrackMap({ vehicles, focusId }: { vehicles: LiveVehicle[]; focusId?: number | null }) {
  const tr = useT();
  const tv = useTValue();
  const { speed } = useUnits();
  const [isClient, setIsClient] = useState(false);
  const [icons, setIcons] = useState<Record<string, unknown>>({});

  // Only vehicles with a REAL reported position are mapped.
  const mappable = useMemo(() => vehicles.filter(hasRealPosition), [vehicles]);

  // Centre on real data only. With nothing to show we zoom out to a neutral
  // world view instead of inventing a location.
  const center = useMemo<LatLngExpression>(() => {
    if (!mappable.length) return [20, 0];
    const lat = mappable.reduce((s, v) => s + v.lat, 0) / mappable.length;
    const lng = mappable.reduce((s, v) => s + v.lng, 0) / mappable.length;
    return [lat, lng];
  }, [mappable]);
  const initialZoom = mappable.length ? 12 : 2;

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (!isClient) return;
    import("leaflet").then((L) => {
      const mk = (url: string) => L.icon({ iconUrl: url, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -32] });
      setIcons({
        moving: mk("https://cdn-icons-png.flaticon.com/512/854/854894.png"),
        stopped: mk("https://cdn-icons-png.flaticon.com/512/854/854866.png"),
        offline: mk("https://cdn-icons-png.flaticon.com/512/854/854878.png"),
      });
    });
  }, [isClient]);

  // Only the (very brief) server/first-client frame shows a placeholder; the
  // map itself renders immediately after mount so it never appears blank or
  // late. Markers are added as soon as icons + real positions are available.
  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[320px] bg-violet-50 rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-violet-500">
          <div className="w-9 h-9 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <span className="font-medium">{tr("ui.loading_map")}</span>
        </div>
      </div>
    );
  }

  const iconsReady = Object.keys(icons).length > 0;

  return (
    <div className="w-full h-full min-h-[320px] relative rounded-2xl overflow-hidden">
      {/* Empty state is an overlay, not a replacement: the map still renders
          immediately and stays fully pannable/zoomable. */}
      {mappable.length === 0 && (
        <div className="absolute inset-x-0 top-3 z-[1000] flex justify-center pointer-events-none px-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-soft px-4 py-2.5 text-center max-w-sm">
            <p className="font-semibold text-violet-800 text-sm">{tr("ui.no_live_positions_yet")}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tr("ui.vehicles_appear_hint")}</p>
          </div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={initialZoom}
        scrollWheelZoom
        // Full world navigation: zoom right out and pan anywhere (Brazil, any
        // country). Bounds are the WORLD only, purely so the user cannot drag
        // off into blank grey space above/below the map.
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={0.3}
        worldCopyJump
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController vehicles={mappable} focusId={focusId} />
        {iconsReady && mappable.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng] as LatLngExpression} icon={icons[bucket(v)] as never}>
            <Popup>
              <div className="font-bold text-violet-800 text-base mb-1">{v.model || v.plate_number}</div>
              <div className="text-slate-600 mb-0.5">{tr("ui.plate")} <span className="font-mono">{v.plate_number}</span></div>
              <div className="text-slate-600 mb-0.5">{tr("ui.driver")} <span className="font-semibold">{v.driver?.full_name || tr("ui.unassigned")}</span></div>
              <div className="mb-0.5">{tr("ui.status")} <span className="font-semibold">{tv(v.live_status)}</span></div>
              {v.live_status === "MOVING" || v.live_status === "STOPPED" ? (
                <div className="mb-0.5">{tr("ui.speed")} <span className="font-mono text-violet-700">{speed(v.speed)}</span></div>
              ) : (
                // Not currently reporting: the pin is a historical fix, so say so.
                <div className="mb-0.5 text-amber-700 font-semibold">
                  {tr("liveMap.lastKnownPosition")} · {whenSeen(v.last_seen_at)}
                </div>
              )}
              {v.trip && <div className="text-slate-600 mb-0.5">{tr("liveMap.trip")}: {v.trip.origin} → {v.trip.destination}</div>}
              {v.cargo && v.cargo.length > 0 && (
                <div className="text-slate-600">{tr("liveMap.cargo")}: {v.cargo.map((c) => `${c.description} ×${c.quantity}`).join(", ")}</div>
              )}
            </Popup>
            <Tooltip direction="top" offset={[0, -22]} opacity={0.95}>
              {v.plate_number}
              {v.live_status === "MOVING" || v.live_status === "STOPPED"
                ? ` · ${speed(v.speed)}`
                : ` · ${tr("liveMap.lastKnownPosition")}`}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
