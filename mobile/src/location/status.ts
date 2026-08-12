/**
 * Honest tracking status. We never claim "tracking active" when location
 * permission is missing, GPS is off, or the device is offline — the UI shows
 * the real state instead.
 *
 * Tracking auto-starts once permissions are granted, so there is no manual
 * on/off state: the status reflects what the system is genuinely doing.
 */
import * as Location from "expo-location";
import * as Network from "expo-network";
import { getLastSync } from "../storage";
import { queueSize } from "./queue";
import { LOCATION_TASK } from "../config";

export type TrackingStatus =
  | "ACTIVE" // tracking, permissions ok, GPS on, online
  | "OFFLINE" // tracking, but no internet (fixes are queued locally)
  | "GPS_DISABLED" // device location services turned off
  | "PERMISSION_MISSING" // background location permission not granted
  | "STARTING"; // permissions fine, tracking not running yet

export type StatusInfo = {
  status: TrackingStatus;
  pending: number; // fixes waiting to upload
  online: boolean;
  lastSync: Date | null;
  backgroundGranted: boolean;
  servicesEnabled: boolean;
};

export async function computeStatus(): Promise<StatusInfo> {
  const [pending, lastSync, net] = await Promise.all([
    queueSize(),
    getLastSync(),
    Network.getNetworkStateAsync().catch(
      () => ({ isConnected: true, isInternetReachable: true } as any)
    ),
  ]);
  const online = !!net.isConnected && net.isInternetReachable !== false;

  const fg = await Location.getForegroundPermissionsAsync().catch(() => null);
  const bg = await Location.getBackgroundPermissionsAsync().catch(() => null);
  const backgroundGranted = bg?.status === "granted" && fg?.status === "granted";

  const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => false);

  const base = { pending, online, lastSync, backgroundGranted, servicesEnabled };

  if (!backgroundGranted) return { status: "PERMISSION_MISSING", ...base };
  if (!servicesEnabled) return { status: "GPS_DISABLED", ...base };

  const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(
    () => false
  );
  if (!running) return { status: "STARTING", ...base };

  return { status: online ? "ACTIVE" : "OFFLINE", ...base };
}

export const STATUS_LABEL: Record<TrackingStatus, string> = {
  ACTIVE: "Tracking active",
  OFFLINE: "Offline — saving locally",
  GPS_DISABLED: "Location is off",
  PERMISSION_MISSING: "Permission needed",
  STARTING: "Starting tracking…",
};

export const STATUS_DETAIL: Record<TrackingStatus, string> = {
  ACTIVE: "Your position is being shared with your fleet.",
  OFFLINE: "No internet. Trips are stored and will sync automatically.",
  GPS_DISABLED: "Turn on location (GPS) so your trips can be recorded.",
  PERMISSION_MISSING:
    "Pathnio needs “Allow all the time” location to record your trips.",
  STARTING: "Getting things ready…",
};

export const STATUS_COLOR: Record<TrackingStatus, string> = {
  ACTIVE: "#34d399",
  OFFLINE: "#f59e0b",
  GPS_DISABLED: "#f87171",
  PERMISSION_MISSING: "#f87171",
  STARTING: "#a78bfa",
};

/** "just now" / "3 min ago" / "14:05" — human last-sync text. */
export function agoLabel(d: Date | null): string {
  if (!d) return "not yet";
  const secs = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (secs < 45) return "just now";
  if (secs < 3600) return `${Math.round(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)} h ago`;
  return d.toLocaleDateString();
}
