/**
 * Background location task.
 *
 * THIS IS THE PART THAT RUNS WHEN THE APP IS CLOSED. The OS invokes this task
 * in a headless JS context (no UI, no React tree) whenever new location fixes
 * are available. It must be defined at module load time — index.ts imports this
 * file BEFORE registering the root component so the definition exists the moment
 * the OS relaunches us in the background.
 *
 * All it does: turn raw fixes into pings, queue them, and try to upload.
 */
import * as TaskManager from "expo-task-manager";
import type { LocationObject } from "expo-location";
import { LOCATION_TASK } from "../config";
import { Ping } from "../api";
import { enqueue, flush } from "./queue";
import { getLastFix, setLastFix } from "../storage";

type LocationTaskData = { locations: LocationObject[] };

// Lightweight RFC-4122 v4 UUID (no native dep needed) for idempotency keys.
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Great-circle distance in metres. */
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Real speed in m/s.
 *
 * Android reports `-1` (and iOS `null`) when speed is unknown — treating that
 * as 0 wrongly marks a moving vehicle as stopped. When the OS gives us nothing
 * usable we derive speed from the distance/time between consecutive fixes.
 */
function resolveSpeed(
  loc: LocationObject,
  prev: { lat: number; lng: number; t: number } | null
): number {
  const raw = loc.coords.speed;
  if (typeof raw === "number" && raw >= 0 && Number.isFinite(raw)) return raw;
  if (!prev) return 0;
  const dt = (loc.timestamp - prev.t) / 1000;
  if (dt <= 0 || dt > 300) return 0; // stale reference — don't invent a speed
  const metres = haversine(prev.lat, prev.lng, loc.coords.latitude, loc.coords.longitude);
  const derived = metres / dt;
  // Guard against GPS jitter producing absurd values (>250 km/h).
  return derived > 70 ? 0 : derived;
}

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("[pathnio] location task error:", error.message);
    return;
  }
  const { locations } = (data ?? {}) as LocationTaskData;
  if (!locations || locations.length === 0) return;

  let prev = await getLastFix();
  const pings: Ping[] = [];

  // Process oldest -> newest so each fix can use the one before it.
  const ordered = [...locations].sort((a, b) => a.timestamp - b.timestamp);
  for (const loc of ordered) {
    const speed = resolveSpeed(loc, prev);
    pings.push({
      event_id: uuidv4(),
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      speed, // m/s — backend converts to km/h
      heading: loc.coords.heading ?? null,
      accuracy: loc.coords.accuracy ?? null,
      altitude: loc.coords.altitude ?? null,
      // Known gap: no battery integration yet (would need the expo-battery
      // dependency, not currently installed), so server-side low-battery
      // alerting can't work off this field. Left null rather than faked.
      battery: null,
      is_moving: speed > 0.5,
      recorded_at: new Date(loc.timestamp).toISOString(),
    });
    prev = { lat: loc.coords.latitude, lng: loc.coords.longitude, t: loc.timestamp };
  }

  if (prev) await setLastFix(prev);
  await enqueue(pings);
  await flush(); // best-effort; anything unsent stays queued for next time
});
