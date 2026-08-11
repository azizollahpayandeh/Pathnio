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
  } | null;
  company: { id: number; name: string } | null;
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

/** Exchange the stored refresh token for a fresh access token. */
async function refreshAccess(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${API_PREFIX}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
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
