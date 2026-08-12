/**
 * Low-level persistence used by BOTH the React UI and the headless background
 * task. Because the background task can run with no React tree mounted (even
 * after the app is closed), all of this is plain async functions — no hooks.
 *
 * Tokens live in SecureStore (encrypted keystore/keychain). The ping queue is
 * bulkier and non-secret, so it lives in AsyncStorage.
 */
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KEYS } from "./config";

// ---- Auth tokens ----------------------------------------------------------

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(KEYS.access, access);
  await SecureStore.setItemAsync(KEYS.refresh, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.access);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.refresh);
}

export async function saveAccessToken(access: string) {
  await SecureStore.setItemAsync(KEYS.access, access);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(KEYS.access);
  await SecureStore.deleteItemAsync(KEYS.refresh);
  await SecureStore.deleteItemAsync(KEYS.user);
}

// ---- Cached user ----------------------------------------------------------

export type StoredUser = {
  id: number;
  username: string;
  email?: string;
  is_driver?: boolean;
};

export async function saveUser(user: StoredUser) {
  await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(KEYS.user);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

// ---- Duty flag ------------------------------------------------------------

export async function setOnDuty(on: boolean) {
  await AsyncStorage.setItem(KEYS.duty, on ? "1" : "0");
}

export async function isOnDuty(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.duty)) === "1";
}

// ---- Last successful sync --------------------------------------------------

export async function setLastSync(when: Date = new Date()) {
  await AsyncStorage.setItem(KEYS.lastSync, when.toISOString());
}

export async function getLastSync(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastSync);
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// ---- Previous fix (used to derive speed when the OS reports none) ----------

export type LastFix = { lat: number; lng: number; t: number };

export async function setLastFix(fix: LastFix) {
  await AsyncStorage.setItem(KEYS.lastFix, JSON.stringify(fix));
}

export async function getLastFix(): Promise<LastFix | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastFix);
  if (!raw) return null;
  try {
    const f = JSON.parse(raw);
    return typeof f?.lat === "number" && typeof f?.lng === "number" ? f : null;
  } catch {
    return null;
  }
}
