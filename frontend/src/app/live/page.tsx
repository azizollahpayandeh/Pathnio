"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LiveVehicle } from "@/components/LiveTrackMap";

const LiveTrackMap = dynamic(() => import("@/components/LiveTrackMap"), { ssr: false });

// Same base-URL logic as src/app/api.ts, kept standalone so this page does not
// touch the localStorage demo auth.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://pathnio-backend-api.vercel.app");

const TOKEN_KEY = "pathnio_live_access";
const POLL_MS = 3000;

type LiveStatus = "moving" | "stopped" | "offline";
function statusOf(v: LiveVehicle): LiveStatus {
  if (v.status && v.status !== "Active") return "offline";
  return v.speed > 0 ? "moving" : "stopped";
}
const dot: Record<LiveStatus, string> = {
  moving: "bg-emerald-500",
  stopped: "bg-amber-500",
  offline: "bg-rose-500",
};

export default function LivePage() {
  const [token, setToken] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [lastSync, setLastSync] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // login form
  const [username, setUsername] = useState("manager");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore a token from a previous visit.
  useEffect(() => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) setToken(t);
  }, []);

  const fetchVehicles = useCallback(async (tk: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/accounts/vehicles/`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (res.status === 401) {
        setToken(null);
        sessionStorage.removeItem(TOKEN_KEY);
        setError("Session expired — please sign in again.");
        return;
      }
      const data = await res.json();
      const list: LiveVehicle[] = Array.isArray(data) ? data : data.results ?? [];
      setVehicles(list);
      setLastSync(new Date().toLocaleTimeString());
      setError(null);
    } catch {
      setError(`Can't reach backend at ${API_BASE}. Is Django running?`);
    }
  }, []);

  // Poll while logged in.
  useEffect(() => {
    if (!token) {
      if (poll.current) clearInterval(poll.current);
      return;
    }
    fetchVehicles(token);
    poll.current = setInterval(() => fetchVehicles(token), POLL_MS);
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
  }, [token, fetchVehicles]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Login failed.");
      sessionStorage.setItem(TOKEN_KEY, data.access);
      setToken(data.access);
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setVehicles([]);
  };

  // ---- Login gate ----------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0720] p-6">
        <form onSubmit={signIn} className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-xl">
          <h1 className="text-2xl font-extrabold text-violet-800 mb-1">Pathnio Live</h1>
          <p className="text-slate-500 text-sm mb-6">Manager sign in — real-time fleet map</p>

          <label className="block text-sm text-slate-600 mb-1">Username</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-4"
            value={username}
            autoCapitalize="none"
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="block text-sm text-slate-600 mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl py-3 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Backend: {API_BASE}
          </p>
        </form>
      </div>
    );
  }

  // ---- Live map ------------------------------------------------------------
  const counts = vehicles.reduce(
    (c, v) => ((c[statusOf(v)] += 1), c),
    { moving: 0, stopped: 0, offline: 0 } as Record<LiveStatus, number>
  );

  return (
    <div className="min-h-screen bg-[#0f0720] text-white">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-black">P</div>
          <div>
            <div className="font-extrabold text-lg leading-tight">Pathnio Live</div>
            <div className="text-violet-300 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              live · synced {lastSync || "…"}
            </div>
          </div>
        </div>
        <button onClick={signOut} className="text-rose-300 text-sm font-semibold">
          Sign out
        </button>
      </header>

      {error && (
        <div className="mx-6 mb-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden h-[72vh] bg-violet-50">
          <LiveTrackMap vehicles={vehicles} />
        </div>

        {/* Side panel */}
        <aside className="rounded-2xl bg-[#1a1330] p-4 h-[72vh] overflow-y-auto">
          <div className="flex gap-4 text-sm mb-4">
            <span className="text-emerald-400 font-semibold">{counts.moving} moving</span>
            <span className="text-amber-400 font-semibold">{counts.stopped} stopped</span>
            <span className="text-rose-400 font-semibold">{counts.offline} offline</span>
          </div>

          {vehicles.length === 0 && (
            <p className="text-violet-300 text-sm">
              No vehicles yet. Start the mobile app (driver1) and go On Duty.
            </p>
          )}

          <ul className="space-y-2">
            {vehicles.map((v) => {
              const st = statusOf(v);
              return (
                <li key={v.id} className="rounded-xl bg-[#241a40] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold">{v.plate_number}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${dot[st]}`} />
                  </div>
                  <div className="text-violet-300 text-xs mt-1">{v.driver || "—"}</div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-violet-200">{v.speed} km/h</span>
                    <span className="text-violet-400 font-mono">
                      {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
