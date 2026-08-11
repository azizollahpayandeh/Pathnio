/**
 * Pathnio driver app — configuration.
 *
 * Edit API_BASE_URL to point at your Pathnio backend.
 *  - Local dev on a PHYSICAL phone: use your computer's LAN IP (NOT localhost),
 *    e.g. http://192.168.70.129:8000  — and make sure that IP is in Django's
 *    ALLOWED_HOSTS (for dev you can set ALLOWED_HOSTS=* ).
 *  - Android emulator: http://10.0.2.2:8000
 *  - Production: your https URL.
 */
export const API_BASE_URL = "https://pathnio-backend-api.vercel.app";

/** Full API path prefix (Django mounts the accounts app under /api/accounts/). */
export const API_PREFIX = `${API_BASE_URL}/api`;

/** Background location task identifier (must be a stable, unique string). */
export const LOCATION_TASK = "pathnio-location-task";

/**
 * Tracking profiles. The MVP ships "eco" — battery-friendly, motion-biased.
 * Numbers are the knobs we discussed: distance filter (m) + time fallback (ms).
 */
export const PROFILES = {
  eco: {
    label: "Eco",
    // Emit a fix roughly every 100 m of movement, or every 45 s as a fallback.
    distanceInterval: 100, // metres
    timeInterval: 45000, // ms
    // Batch fixes on the device before the OS wakes the app to deliver them.
    deferredUpdatesInterval: 45000, // ms
    deferredUpdatesDistance: 100, // metres
    // "Balanced" = ~100 m accuracy, uses network/GPS blend → far cheaper than High.
    accuracy: 3, // Location.Accuracy.Balanced (kept numeric to avoid an import here)
  },
} as const;

export type ProfileName = keyof typeof PROFILES;

/** How many fixes to send per upload request (keeps payloads small). */
export const UPLOAD_BATCH_SIZE = 50;

/** Storage keys. */
export const KEYS = {
  access: "pathnio_access",
  refresh: "pathnio_refresh",
  user: "pathnio_user",
  duty: "pathnio_on_duty",
  queue: "pathnio_ping_queue",
} as const;
