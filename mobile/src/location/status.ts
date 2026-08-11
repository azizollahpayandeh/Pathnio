/**
 * Honest tracking status. We never claim "tracking active" when location
 * permission is missing, GPS is off, or the device is offline — the UI shows
 * the real state instead.
 */
import * as Location from "expo-location";
import * as Network from "expo-network";
import { isOnDuty } from "../storage";
import { queueSize } from "./queue";

export type TrackingStatus =
  | "ACTIVE" // on duty, permission ok, GPS on, online
  | "OFFLINE" // on duty + tracking, but no internet (fixes are queued)
  | "GPS_DISABLED" // location services turned off
  | "PERMISSION_MISSING" // location permission not granted
  | "PAUSED"; // off duty

export type StatusInfo = {
  status: TrackingStatus;
  pending: number; // fixes waiting to upload
  online: boolean;
};

export async function computeStatus(): Promise<StatusInfo> {
  const [onDuty, pending, net] = await Promise.all([
    isOnDuty(),
    queueSize(),
    Network.getNetworkStateAsync().catch(() => ({ isConnected: true, isInternetReachable: true } as any)),
  ]);
  const online = !!net.isConnected && net.isInternetReachable !== false;

  if (!onDuty) return { status: "PAUSED", pending, online };

  const fg = await Location.getForegroundPermissionsAsync();
  if (fg.status !== "granted") return { status: "PERMISSION_MISSING", pending, online };

  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) return { status: "GPS_DISABLED", pending, online };

  if (!online) return { status: "OFFLINE", pending, online };
  return { status: "ACTIVE", pending, online };
}

export const STATUS_LABEL: Record<TrackingStatus, string> = {
  ACTIVE: "Tracking active",
  OFFLINE: "Offline — buffering",
  GPS_DISABLED: "GPS disabled",
  PERMISSION_MISSING: "Location permission needed",
  PAUSED: "Tracking paused",
};

export const STATUS_COLOR: Record<TrackingStatus, string> = {
  ACTIVE: "#34d399",
  OFFLINE: "#f59e0b",
  GPS_DISABLED: "#f87171",
  PERMISSION_MISSING: "#f87171",
  PAUSED: "#6b7280",
};
