"use client";

import { useEffect, useState } from "react";
import type { Database } from "./types";
import { createSeedDatabase } from "./seed";

// A tiny, dependency-free, localStorage-backed reactive store.
// It is the single source of truth for the Pathnio demo so that every
// create/edit/delete persists across reloads and stays in sync across tabs.

const KEY = "pathnio_db_v3";
const EVENT = "pathnio:change";

type Collection = Exclude<keyof Database, "settings">;

let cache: Database | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function load(): Database {
  if (!isBrowser()) return createSeedDatabase();
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cache = { ...createSeedDatabase(), ...JSON.parse(raw) };
      return cache!;
    }
  } catch {
    // corrupted storage — fall back to a fresh seed
  }
  cache = createSeedDatabase();
  persist();
  return cache;
}

function persist() {
  if (!isBrowser() || !cache) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage full / unavailable — ignore, in-memory cache still works
  }
}

function notify() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(EVENT));
}

function commit(next: Database) {
  cache = next;
  persist();
  notify();
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// ---- Generic collection helpers -------------------------------------------

export function getAll<K extends Collection>(name: K): Database[K] {
  return load()[name];
}

export function setAll<K extends Collection>(name: K, items: Database[K]) {
  const db = load();
  commit({ ...db, [name]: items });
}

export function insert<K extends Collection>(
  name: K,
  item: Database[K][number]
) {
  const db = load();
  commit({ ...db, [name]: [item, ...(db[name] as unknown[])] as Database[K] });
  return item;
}

export function update<K extends Collection>(
  name: K,
  id: string,
  patch: Partial<Database[K][number]>
) {
  const db = load();
  const next = (db[name] as Array<{ id: string }>).map((row) =>
    row.id === id ? { ...row, ...patch } : row
  ) as Database[K];
  commit({ ...db, [name]: next });
}

export function remove<K extends Collection>(name: K, id: string) {
  const db = load();
  const next = (db[name] as Array<{ id: string }>).filter(
    (row) => row.id !== id
  ) as Database[K];
  commit({ ...db, [name]: next });
}

export function findById<K extends Collection>(
  name: K,
  id: string
): Database[K][number] | undefined {
  return (load()[name] as Array<{ id: string }>).find(
    (row) => row.id === id
  ) as Database[K][number] | undefined;
}

// ---- Settings --------------------------------------------------------------

export function getSettings(): Database["settings"] {
  return load().settings;
}

export function setSettings(patch: Partial<Database["settings"]>) {
  const db = load();
  commit({ ...db, settings: { ...db.settings, ...patch } });
}

// ---- Reset -----------------------------------------------------------------

export function resetDatabase() {
  commit(createSeedDatabase());
}

// ---- Subscription ----------------------------------------------------------

export function subscribe(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cache = null; // another tab changed it — invalidate cache
      cb();
    }
  });
  return () => window.removeEventListener(EVENT, handler);
}

// ---- React hooks -----------------------------------------------------------

/**
 * Reactive read of a collection. Returns [] on the server / first paint and the
 * real data after mount, which keeps SSR and client markup in sync (no
 * hydration mismatch) while still reflecting live edits.
 */
export function useCollection<K extends Collection>(
  name: K
): [Database[K], boolean] {
  const [data, setData] = useState<Database[K]>(
    () => createSeedDatabase()[name]
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setData(getAll(name));
    sync();
    setReady(true);
    return subscribe(sync);
  }, [name]);

  return [data, ready];
}

export function useSettings(): [
  Database["settings"],
  (patch: Partial<Database["settings"]>) => void
] {
  const [data, setData] = useState<Database["settings"]>(
    () => createSeedDatabase().settings
  );
  useEffect(() => {
    const sync = () => setData(getSettings());
    sync();
    return subscribe(sync);
  }, []);
  return [data, setSettings];
}
