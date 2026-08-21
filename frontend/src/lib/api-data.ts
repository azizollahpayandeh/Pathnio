"use client";

// Real backend data layer for the dashboard (drivers, vehicles, live map).
// All reads/writes are company-scoped and authorized server-side — the client
// never sends a company_id. Replaces the old localStorage demo store.

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/app/api";
import type { Driver, Vehicle, Trip, Expense, Alert } from "./types";

// ---- Mapping backend rows -> UI types -------------------------------------

function mapDriver(d: any): Driver {
  return {
    id: String(d.id),
    full_name: d.full_name || "",
    mobile: d.mobile || "",
    email: d.email || d.user?.email || "",
    license_no: "",
    vehicle_type: (d.vehicle_type || "") as Driver["vehicle_type"],
    plate_number: d.plate_number || "",
    // Status is SYSTEM-DERIVED by the backend (activation + active trip +
    // telemetry recency). The UI only displays it — never sets it.
    status: (d.status || "Inactive") as Driver["status"],
    total_trips: 0,
    // Activated = the driver has claimed a login account via an invitation.
    activated: d.activated ?? !!d.user,
    joined_at: d.created_at || new Date().toISOString(),
    createdAt: d.created_at || new Date().toISOString(),
  };
}

// ---- Driver invitations (Phase 3) -----------------------------------------

export type InvitationInfo = {
  status: string;
  is_active: boolean;
  is_expired: boolean;
  expires_at: string;
} | null;

export async function createInvitation(driverId: string): Promise<{ token: string; invitation: InvitationInfo }> {
  const r = await api.post(`accounts/drivers/${driverId}/invitation/`);
  return { token: r.data.token, invitation: r.data.invitation };
}

export async function regenerateInvitation(driverId: string): Promise<{ token: string; invitation: InvitationInfo }> {
  const r = await api.post(`accounts/drivers/${driverId}/invitation/regenerate/`);
  return { token: r.data.token, invitation: r.data.invitation };
}

export async function getInvitation(driverId: string): Promise<InvitationInfo> {
  const r = await api.get(`accounts/drivers/${driverId}/invitation/`);
  return r.data.invitation;
}

export async function revokeInvitation(driverId: string): Promise<void> {
  await api.post(`accounts/drivers/${driverId}/invitation/revoke/`);
}

function mapVehicle(v: any): Vehicle {
  return {
    id: String(v.id),
    plate_number: v.plate_number || "",
    vehicle_type: (v.vehicle_type || "Truck") as Vehicle["vehicle_type"],
    model: v.model || "",
    company: String(v.company ?? ""),
    status: (v.status || "Active") as Vehicle["status"],
    capacity: v.capacity || "",
    color: v.color || "",
    fuel_level: v.fuel_level ?? 0,
    odometer: v.odometer ?? 0,
    efficiency: v.efficiency || "",
    last_maintenance: v.last_maintenance || "",
    total_trips: v.total_trips ?? 0,
    // No telemetry => NO position. Never fall back to 0,0 (Null Island).
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    speed: v.speed ?? 0,
    // Real assignment (source of truth); falls back to legacy display string.
    driver: v.assigned_driver?.full_name || v.driver || "",
    assignedDriverId: v.assigned_driver ? String(v.assigned_driver.id) : null,
    createdAt: v.created_at || new Date().toISOString(),
  } as Vehicle;
}

export async function assignDriver(vehicleId: string, driverId: string): Promise<void> {
  await api.post(`accounts/vehicles/${vehicleId}/assign/`, { driver_id: driverId });
}

export async function unassignVehicle(vehicleId: string): Promise<void> {
  await api.post(`accounts/vehicles/${vehicleId}/unassign/`);
}

function mapTrip(t: any): Trip {
  return {
    id: String(t.id),
    origin: t.origin || "",
    destination: t.destination || "",
    driver: t.driver_name || t.driver || "",
    driver_ref: t.driver_ref ?? null,
    vehicle_ref: t.vehicle_ref ?? null,
    plate_number: t.vehicle_plate || t.plate_number || "",
    distance: t.distance ?? 0,
    status: (t.status || "PLANNED") as Trip["status"],
    cargo: t.cargo || "",
    revenue: Number(t.revenue) || 0,
    notes: t.notes || "",
    start_time: t.start_time || new Date().toISOString(),
    end_time: t.end_time || undefined,
    createdAt: t.created_at || new Date().toISOString(),
  };
}

export async function createTrip(input: Record<string, unknown>): Promise<Trip> {
  const r = await api.post("accounts/trips/", input);
  return mapTrip(r.data);
}

export async function deleteTrip(id: string): Promise<void> {
  await api.delete(`accounts/trips/${id}/`);
}

export async function updateTrip(id: string, patch: Record<string, unknown>): Promise<Trip> {
  const r = await api.patch(`accounts/trips/${id}/`, patch);
  return mapTrip(r.data);
}

export async function createExpense(input: Record<string, unknown>): Promise<Expense> {
  const r = await api.post("accounts/expenses/", input);
  return mapExpense(r.data);
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`accounts/expenses/${id}/`);
}

export async function createCargo(input: Record<string, unknown>): Promise<{ id: number }> {
  const r = await api.post("accounts/cargo/", input);
  return r.data;
}

export async function deleteCargo(id: string): Promise<void> {
  await api.delete(`accounts/cargo/${id}/`);
}

function mapExpense(e: any): Expense {
  return {
    id: String(e.id),
    title: e.title || "",
    category: (e.category || "Other") as Expense["category"],
    amount: Number(e.amount) || 0,
    date: e.date || new Date().toISOString(),
    plate_number: e.plate_number || "",
    vehicleId: e.vehicle_ref != null ? String(e.vehicle_ref) : undefined,
    driver: e.driver || "",
    status: (e.status || "Paid") as Expense["status"],
    description: e.description || "",
    createdAt: e.created_at || new Date().toISOString(),
  };
}

function rows(data: any): any[] {
  return Array.isArray(data) ? data : data?.results ?? [];
}

// ---- Drivers --------------------------------------------------------------

export async function createDriver(input: {
  full_name: string; mobile: string; email?: string;
  plate_number?: string; vehicle_type?: string;
}): Promise<Driver> {
  const r = await api.post("accounts/drivers/", {
    full_name: input.full_name,
    mobile: input.mobile,
    email: input.email || "",
    plate_number: input.plate_number || "",
    vehicle_type: input.vehicle_type || "",
  });
  return mapDriver(r.data);
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete(`accounts/drivers/${id}/`);
}

// ---- Vehicles -------------------------------------------------------------

export async function createVehicle(input: Record<string, unknown>): Promise<Vehicle> {
  const r = await api.post("accounts/vehicles/", input);
  return mapVehicle(r.data);
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`accounts/vehicles/${id}/`);
}

// ---- React hooks ----------------------------------------------------------

function useResource<T>(path: string, map: (row: any) => T) {
  const [data, setData] = useState<T[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const r = await api.get(path);
      setData(rows(r.data).map(map));
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load.");
    } finally {
      setReady(true);
    }
  }, [path, map]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, ready, error, refetch };
}

export function useDrivers() {
  return useResource<Driver>("accounts/drivers/", mapDriver);
}

export function useVehicles() {
  return useResource<Vehicle>("accounts/vehicles/", mapVehicle);
}

function mapAlert(a: any): Alert {
  const plate = a.vehicle_plate ? ` (${a.vehicle_plate})` : "";
  return {
    id: String(a.id),
    alert_type: a.alert_type || "OTHER",
    title: a.title || "",
    message: (a.message || "") + plate,
    priority: (a.severity || "medium") as Alert["priority"],
    read: !!a.acknowledged_at,
    timestamp: a.created_at || new Date().toISOString(),
  };
}

export function useFleetAlerts() {
  return useResource<Alert>("accounts/fleet-alerts/", mapAlert);
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await api.post(`accounts/fleet-alerts/${id}/acknowledge/`);
}

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  reply?: string;
  status: string;
  created_at: string;
  answered_at?: string;
};

function mapTicket(t: any): SupportTicket {
  return {
    id: String(t.id),
    subject: t.subject || "",
    message: t.message || "",
    reply: t.reply || undefined,
    status: t.status || "open",
    created_at: t.created_at || new Date().toISOString(),
    answered_at: t.answered_at || undefined,
  };
}

export function useSupportTickets() {
  return useResource<SupportTicket>("accounts/support/tickets/", mapTicket);
}

export async function createSupportTicket(subject: string, message: string): Promise<SupportTicket> {
  const r = await api.post("accounts/support/tickets/", { subject, message });
  return mapTicket(r.data);
}

export type CompanySettings = {
  timezone: string;
  distance_unit: string;
  currency: string;
  offline_timeout_seconds: number;
  moving_speed_kmh: number;
  telemetry_interval_seconds: number;
};

export type SubscriptionInfo = {
  plan: { code: string; name: string; max_drivers: number; max_vehicles: number; price_monthly: string };
  status: string;
  usage: { drivers: number; vehicles: number };
  plans: { code: string; name: string; max_drivers: number; max_vehicles: number; price_monthly: string }[];
};

export function useSubscription() {
  const [data, setData] = useState<SubscriptionInfo | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    try {
      const r = await api.get("accounts/subscription/");
      setData(r.data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load.");
    } finally { setReady(true); }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, ready, error, refetch };
}

export async function changePlan(code: string): Promise<void> {
  await api.post("accounts/subscription/", { plan: code });
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const r = await api.get("accounts/company/settings/");
  return r.data;
}

export async function updateCompanySettings(patch: Partial<CompanySettings>): Promise<CompanySettings> {
  const r = await api.patch("accounts/company/settings/", patch);
  return r.data;
}

export function useTrips() {
  return useResource<Trip>("accounts/trips/", mapTrip);
}

export function useExpenses() {
  return useResource<Expense>("accounts/expenses/", mapExpense);
}

export type LiveVehicle = {
  id: number;
  plate_number: string;
  model?: string;
  vehicle_type?: string;
  status?: string;
  // null when the vehicle has never reported a real GPS fix.
  lat: number | null;
  lng: number | null;
  has_valid_position?: boolean;
  speed: number;
  last_seen_at?: string | null;
  live_status: "MOVING" | "STOPPED" | "OFFLINE" | "MAINTENANCE" | "INACTIVE";
  driver?: { id: number; full_name: string } | null;
  trip?: { id: number; origin: string; destination: string; status: string } | null;
  cargo?: { description: string; quantity: number; cargo_type?: string }[];
};

/**
 * Live vehicle state for the map — enriched (driver/trip/cargo/status) from the
 * backend's VehicleLatestState feed. MVP transport = polling; this hook is the
 * single seam to swap for SSE/WebSocket/Pusher later with no other changes.
 */
export function useLiveVehicles(intervalMs = 4000) {
  const [data, setData] = useState<LiveVehicle[]>([]);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await api.get("accounts/vehicles/live/");
        if (alive) setData(Array.isArray(r.data) ? r.data : []);
      } catch {
        /* transient — keep last known positions */
      } finally {
        if (alive) setReady(true);
      }
    };
    tick();
    timer.current = setInterval(tick, intervalMs);
    return () => {
      alive = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, [intervalMs]);

  return { data, ready };
}

// ---------------------------------------------------------------------------
// Driver-submitted records (Phase 29). These are written from the phone and
// only READ here — the dashboard reviews what actually happened on the road.
// ---------------------------------------------------------------------------

export type Inspection = {
  id: string;
  kind: "PRE" | "POST";
  odometer: number | null;
  items: Array<{ key: string; ok: boolean; note?: string }>;
  has_defects: boolean;
  defect_notes: string;
  failed_items: string[];
  created_at: string;
  driver_name: string;
  plate_number: string;
};

export type Incident = {
  id: string;
  kind: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  resolved_at: string | null;
  created_at: string;
  driver_name: string;
  plate_number: string;
  lat: number | null;
  lng: number | null;
};

export function useInspections(defectsOnly = false) {
  return useResource<Inspection>(
    `accounts/inspections/${defectsOnly ? "?defects=1" : ""}`,
    (r: Record<string, unknown>) => r as unknown as Inspection
  );
}

export function useIncidents(openOnly = false) {
  return useResource<Incident>(
    `accounts/incidents/${openOnly ? "?open=1" : ""}`,
    (r: Record<string, unknown>) => r as unknown as Incident
  );
}

export async function resolveIncident(id: string): Promise<void> {
  await api.post(`accounts/incidents/${id}/resolve/`);
}

export async function approveExpense(id: string): Promise<void> {
  await api.post(`accounts/expenses/${id}/approve/`);
}

export async function rejectExpense(id: string): Promise<void> {
  await api.post(`accounts/expenses/${id}/reject/`);
}
