/**
 * Start/stop background tracking, and the permission dance — defensively.
 *
 * Background location needs TWO grants, requested in order:
 *   1. Foreground ("while using") location
 *   2. Background ("always") location  ← Android/iOS gate this hard
 *
 * We NEVER call startLocationUpdatesAsync unless background permission is
 * actually granted and location services are on, and we wrap the native call
 * so an OEM/JobScheduler rejection surfaces as an error instead of crashing.
 */
import * as Location from "expo-location";
import { LOCATION_TASK, PROFILES, ProfileName } from "../config";

export type PermissionResult = {
  granted: boolean; // true only when BACKGROUND is granted
  foreground: Location.PermissionStatus;
  background: Location.PermissionStatus;
};

/** A tracking-start failure we can show in the UI (never crash on it). */
export class TrackingError extends Error {}

/** Are device location services (GPS) switched on? */
export async function areServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

/** Request foreground, then (only if granted) background permission. */
export async function requestPermissions(): Promise<PermissionResult> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") {
    return { granted: false, foreground: fg.status, background: fg.status };
  }
  const bg = await Location.requestBackgroundPermissionsAsync();
  return {
    granted: bg.status === "granted",
    foreground: fg.status,
    background: bg.status,
  };
}

export async function hasBackgroundPermission(): Promise<boolean> {
  try {
    const bg = await Location.getBackgroundPermissionsAsync();
    return bg.status === "granted";
  } catch {
    return false;
  }
}

export async function isTracking(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  } catch {
    return false;
  }
}

/**
 * Begin background tracking. Verifies every precondition first and wraps the
 * native scheduling call. Idempotent: never double-schedules the task.
 * Throws TrackingError (with a user-readable message) on any problem.
 */
export async function startTracking(profile: ProfileName = "eco"): Promise<void> {
  // Never double-register/reschedule the same task.
  if (await isTracking()) return;

  if (!(await hasBackgroundPermission())) {
    throw new TrackingError(
      "Background location permission is required for trip tracking."
    );
  }
  if (!(await areServicesEnabled())) {
    throw new TrackingError(
      "Location services (GPS) are off. Turn them on to start tracking."
    );
  }

  const p = PROFILES[profile];
  try {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: p.accuracy as Location.Accuracy,
      distanceInterval: p.distanceInterval,
      timeInterval: p.timeInterval,
      deferredUpdatesInterval: p.deferredUpdatesInterval,
      deferredUpdatesDistance: p.deferredUpdatesDistance,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.AutomotiveNavigation,
      showsBackgroundLocationIndicator: true,
      // Android: the foreground service keeps us alive after the app is
      // closed/swiped. The persistent notification is mandatory.
      foregroundService: {
        notificationTitle: "Pathnio — on duty",
        notificationBody: "Sharing your location with your fleet manager.",
        notificationColor: "#7c3aed",
      },
    });
  } catch (e: any) {
    // A native rejection (e.g. JobScheduler/OEM policy) must NOT crash the app.
    throw new TrackingError(
      e?.message || "Android could not start the tracking service."
    );
  }
}

export async function stopTracking(): Promise<void> {
  try {
    if (await isTracking()) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    }
  } catch {
    /* stopping is best-effort — never throw */
  }
}

/**
 * Startup safety net. If a background task is somehow still registered but the
 * required permissions are no longer valid (revoked after install, upgraded
 * from a broken build, etc.), stop it cleanly so nothing loops. Never throws.
 */
export async function reconcileTracking(): Promise<void> {
  try {
    if (!(await isTracking())) return;
    const fg = await Location.getForegroundPermissionsAsync();
    const bgOk = await hasBackgroundPermission();
    if (fg.status !== "granted" || !bgOk) {
      await stopTracking();
    }
  } catch {
    /* never throw during startup */
  }
}

/** One-shot current position for the UI (not part of background tracking). */
export async function getCurrentPosition() {
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}
