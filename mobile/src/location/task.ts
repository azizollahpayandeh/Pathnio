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

type LocationTaskData = { locations: LocationObject[] };

// Lightweight RFC-4122 v4 UUID (no native dep needed) for idempotency keys.
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("[pathnio] location task error:", error.message);
    return;
  }
  const { locations } = (data ?? {}) as LocationTaskData;
  if (!locations || locations.length === 0) return;

  const pings: Ping[] = locations.map((loc) => ({
    event_id: uuidv4(),
    lat: loc.coords.latitude,
    lng: loc.coords.longitude,
    speed: Math.max(0, loc.coords.speed ?? 0), // m/s; -1 means "unknown"
    heading: loc.coords.heading ?? null,
    accuracy: loc.coords.accuracy ?? null,
    altitude: loc.coords.altitude ?? null,
    battery: null, // reserved for a later feature
    is_moving: (loc.coords.speed ?? 0) > 0.5,
    recorded_at: new Date(loc.timestamp).toISOString(),
  }));

  await enqueue(pings);
  await flush(); // best-effort; anything unsent stays queued for next time
});
