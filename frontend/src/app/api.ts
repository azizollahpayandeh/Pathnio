import axios from "axios";

// Single Base URL for everything (API + images).
const envBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://pathnio-backend-api.vercel.app");

export const API_BASE_URL = envBase.endsWith("/")
  ? envBase.slice(0, -1)
  : envBase;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${access}`;
    }
  }
  return config;
});

function clearSessionAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

// De-dupe concurrent refreshes so a burst of 401s triggers a single refresh.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;
  if (!refreshing) {
    refreshing = axios
      .post(`${API_BASE_URL}/api/auth/refresh/`, { refresh })
      .then((r) => {
        const access = r.data?.access as string | undefined;
        if (access) {
          localStorage.setItem("access", access);
          document.cookie = `access=${access}; path=/; SameSite=Lax`;
          return access;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

// On 401: try a single refresh + retry; if that fails, clear session -> login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const access = await refreshAccessToken();
      if (access) {
        original.headers = original.headers || {};
        original.headers["Authorization"] = `Bearer ${access}`;
        return api(original);
      }
      clearSessionAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;
