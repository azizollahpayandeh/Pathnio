"use client";

// Real backend data layer for the dashboard (drivers, vehicles, live map).
// All reads/writes are company-scoped and authorized server-side — the client
// never sends a company_id. Replaces the old localStorage demo store.

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/app/api";
import type { Driver, Vehicle, Trip, Expense } from "./types";

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
    // Real status/rating/trip metrics aren't tracked yet -> honest defaults
    // (no fabricated numbers). These become real in a later slice.
    status: "Active",
    rating: 0,
    total_trips: 0,
    joined_at: d.created_at || new Date().toISOString(),
    createdAt: d.created_at || new Date().toISOString(),
  };
}

function mapVehicle(v: any): Vehicle {
  return {
    id: String(v.id),
    plate_number: v.plate_number || "",
    vehicle_type: (v.vehicle_type || "Truck") as Vehicle["vehicle_type"],
    model: v.model || "",
    driver: v.driver || "",
    company: String(v.company ?? ""),
    status: (v.status || "Active") as Vehicle["status"],
    capacity: v.capacity || "",
    color: v.color || "",
    fuel_level: v.fuel_level ?? 0,
    odometer: v.odometer ?? 0,
    efficiency: v.efficiency || "",
    last_maintenance: v.last_maintenance || "",
    total_trips: v.total_trips ?? 0,
    lat: v.lat ?? 0,
    lng: v.lng ?? 0,
    speed: v.speed ?? 0,
    createdAt: v.created_at || new Date().toISOString(),
  };
}

function mapTrip(t: any): Trip {
  return {
    id: String(t.id),
    origin: t.origin || "",
    destination: t.destination || "",
    driver: t.driver || "",
    plate_number: t.plate_number || "",
    distance: t.distance ?? 0,
    status: (t.status || "Scheduled") as Trip["status"],
    cargo: t.cargo || "",
    revenue: Number(t.revenue) || 0,
    start_time: t.start_time || new Date().toISOString(),
    end_time: t.end_time || undefined,
    createdAt: t.created_at || new Date().toISOString(),
  };
}

function mapExpense(e: any): Expense {
  return {
    id: String(e.id),
    title: e.title || "",
    category: (e.category || "Other") as Expense["category"],
    amount: Number(e.amount) || 0,
    date: e.date || new Date().toISOString(),
    plate_number: e.plate_number || "",
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

export function useTrips() {
  return useResource<Trip>("accounts/trips/", mapTrip);
}

export function useExpenses() {
  return useResource<Expense>("accounts/expenses/", mapExpense);
}

/**
 * Live vehicle positions. MVP = polling the latest vehicle state. This is the
 * single seam to change later: swap the interval poll for SSE/WebSocket/Pusher
 * here and every map/consumer updates automatically — no other file changes.
 */
export function useLiveVehicles(intervalMs = 4000) {
  const [data, setData] = useState<Vehicle[]>([]);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await api.get("accounts/vehicles/");
        if (alive) {
          setData(rows(r.data).map(mapVehicle));
        }
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
