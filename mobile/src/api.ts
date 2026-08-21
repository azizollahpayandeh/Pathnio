/**
 * Network layer. Plain fetch (no axios) so the headless background task can use
 * the exact same upload path the UI does.
 */
import { API_PREFIX } from "./config";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveTokens,
  saveUser,
  StoredUser,
} from "./storage";

export type Ping = {
  event_id: string; // client UUID for idempotent retransmits
  lat: number;
  lng: number;
  speed: number; // m/s
  heading?: number | null;
  accuracy?: number | null;
  altitude?: number | null;
  battery?: number | null;
  is_moving?: boolean;
  recorded_at: string; // ISO 8601
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Log in with username + password. Persists tokens + user on success. */
export async function login(
  username: string,
  password: string
): Promise<StoredUser> {
  const res = await fetch(`${API_PREFIX}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.detail || "Login failed.");
  }
  await saveTokens(data.access, data.refresh);
  const user: StoredUser = data.user ?? { id: 0, username };
  await saveUser(user);
  return user;
}

export type DriverContext = {
  activated: boolean;
  driver: {
    id: number;
    full_name: string;
    plate_number: string;
    vehicle_type?: string;
    mobile?: string;
    email?: string;
  } | null;
  company: { id: number; name: string } | null;
  vehicle?: {
    id: number;
    plate_number: string;
    model?: string;
    vehicle_type?: string;
  } | null;
  /** Server-derived active trip (never chosen by the client). */
  trip?: {
    id: number;
    origin: string;
    destination: string;
    status: string;
    cargo?: string;
  } | null;
};

/** Register a bare driver login account (no company/driver until activated). */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<DriverContext & { user: StoredUser }> {
  const res = await fetch(`${API_PREFIX}/accounts/driver/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.detail || "Registration failed.");
  await saveTokens(data.access, data.refresh);
  const user: StoredUser = data.user ?? { id: 0, username };
  await saveUser(user);
  return { user, activated: !!data.activated, driver: data.driver, company: data.company };
}

/**
 * Fired when a refresh attempt is DEFINITIVELY rejected by the server (as
 * opposed to a transient network failure) — i.e. the session is genuinely
 * over, not just temporarily unreachable. AuthProvider registers a listener
 * that runs the same logout path as the app's bootstrap check, so an
 * expired session gets a clear "please log in again" instead of the driver
 * seeing silent, repeated "could not update" alerts for the rest of the
 * shift. Left null (a harmless no-op) when nothing is listening, e.g. from
 * the headless background task, which has no UI to redirect.
 */
type SessionExpiredListener = () => void;
let sessionExpiredListener: SessionExpiredListener | null = null;
export function setSessionExpiredListener(listener: SessionExpiredListener | null) {
  sessionExpiredListener = listener;
}

// Shared by every concurrent caller so a refresh token that the backend
// single-uses/rotates is only ever redeemed once per expiry — without this,
// authedRequest() and uploadPings() hitting a 401 at the same moment would
// each fire their own refresh call with the same (soon-to-be-invalid) token,
// and the losing call would fail needlessly.
let refreshPromise: Promise<string | null> | null = null;

/** Exchange the stored refresh token for a fresh access token. */
function refreshAccess(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function doRefresh(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  let res: Response;
  try {
    res = await fetch(`${API_PREFIX}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    return null; // transient network failure — session may still be valid
  }

  if (!res.ok) {
    // The refresh token itself was rejected (expired/rotated/revoked): the
    // session is over, not just offline.
    sessionExpiredListener?.();
    return null;
  }
  const data = await res.json().catch(() => ({}));
  if (!data?.access) return null;
  await saveAccessToken(data.access);
  return data.access;
}

/** Authenticated request helper with a single 401 refresh-retry. */
async function authedRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string) =>
    fetch(`${API_PREFIX}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  const token = await getAccessToken();
  if (!token) throw new ApiError(401, "Not authenticated.");
  let res = await doFetch(token);
  if (res.status === 401) {
    const fresh = await refreshAccess();
    if (fresh) res = await doFetch(fresh);
  }
  return res;
}

/** Backend is the source of truth for activation status + driver/company. */
export async function fetchDriverContext(): Promise<DriverContext> {
  const res = await authedRequest("/accounts/driver/me/", { method: "GET" });
  if (!res.ok) throw new ApiError(res.status, "Failed to load driver context.");
  return res.json();
}

/** Activate this account by binding it to a driver via an invitation code. */
export async function activate(token: string): Promise<DriverContext> {
  const res = await authedRequest("/accounts/driver-invitations/activate/", {
    method: "POST",
    body: JSON.stringify({ token: token.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.detail || "Activation failed.");
  return data;
}

/**
 * Upload a batch of GPS fixes. Returns true if the server accepted them.
 * Transparently refreshes the access token once on a 401.
 */
export async function uploadPings(pings: Ping[]): Promise<boolean> {
  if (pings.length === 0) return true;

  const send = async (token: string) =>
    fetch(`${API_PREFIX}/accounts/locations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ locations: pings }),
    });

  let token = await getAccessToken();
  if (!token) return false;

  let res = await send(token);
  if (res.status === 401) {
    const fresh = await refreshAccess();
    if (!fresh) return false;
    res = await send(fresh);
  }
  return res.ok;
}

// ---------------------------------------------------------------------------
// Driver operations — the phone can now RUN the job, not just report position.
// Company / vehicle / driver are always derived server-side from the token, so
// none of these calls carry (or trust) an identifier the app made up.
// ---------------------------------------------------------------------------

export type TripActionResult = {
  id: number;
  status: string;
  start_odometer: number | null;
  end_odometer: number | null;
  distance: number;
  started_at: string | null;
  completed_at: string | null;
};

async function jsonOrThrow(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Raw serializer text (e.g. "This field is required.") reads like a bug
    // report to a driver with no surrounding context — frame it as ours
    // rather than surfacing it bare, while keeping the useful detail.
    const raw =
      data?.detail ||
      (typeof data === "object" && data
        ? (Object.values(data).flat()[0] as string)
        : null);
    const detail = raw ? `Couldn't submit: ${raw}` : fallback;
    throw new ApiError(res.status, String(detail));
  }
  return data;
}

/** Start or complete the driver's own trip, recording the odometer. */
export async function tripAction(
  tripId: number,
  action: "start" | "complete",
  body: { odometer?: number | null; notes?: string } = {}
): Promise<TripActionResult> {
  const res = await authedRequest(`/accounts/driver/trips/${tripId}/${action}/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res, "Could not update the trip.");
}

export type InspectionItem = { key: string; ok: boolean; note?: string };

export async function fetchInspectionChecklist(): Promise<{
  checklist: string[];
  recent: Array<{ id: number; kind: string; has_defects: boolean; created_at: string }>;
}> {
  const res = await authedRequest("/accounts/driver/inspections/", { method: "GET" });
  return jsonOrThrow(res, "Could not load the checklist.");
}

export async function submitInspection(body: {
  kind: "PRE" | "POST";
  items: InspectionItem[];
  odometer?: number | null;
  defect_notes?: string;
  lat?: number | null;
  lng?: number | null;
  trip_id?: number | null;
}): Promise<{ id: number; has_defects: boolean; failed_items: string[] }> {
  const res = await authedRequest("/accounts/driver/inspections/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res, "Could not submit the inspection.");
}

export async function reportIncident(body: {
  kind: "BREAKDOWN" | "ACCIDENT" | "DELAY" | "THEFT" | "OTHER";
  severity?: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  lat?: number | null;
  lng?: number | null;
  trip_id?: number | null;
}): Promise<{ id: number }> {
  const res = await authedRequest("/accounts/driver/incidents/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res, "Could not report the incident.");
}

export async function submitExpense(body: {
  category: string;
  amount: string;
  description?: string;
  odometer?: number | null;
  liters?: string | null;
  date?: string;
}): Promise<{ id: number; approval: string }> {
  const res = await authedRequest("/accounts/driver/expenses/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return jsonOrThrow(res, "Could not save the expense.");
}

export async function fetchMyExpenses(): Promise<
  Array<{ id: number; title: string; category: string; amount: string; date: string; approval: string }>
> {
  const res = await authedRequest("/accounts/driver/expenses/", { method: "GET" });
  return jsonOrThrow(res, "Could not load your expenses.");
}
