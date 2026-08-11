"use client";

import { useEffect, useState } from "react";
import type { User } from "./types";
import { API_BASE_URL } from "@/app/api";

// Real backend authentication (JWT). Access/refresh tokens live in
// localStorage; the access token is mirrored to a cookie so the Next.js
// middleware can gate the auth routes. The api.ts axios client attaches the
// access token to every request and refreshes it on 401.

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const USER_KEY = "user";
const AUTH_EVENT = "pathnio:auth";

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, days = 5) {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}
function clearCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
function emit() {
  if (isBrowser()) window.dispatchEvent(new Event(AUTH_EVENT));
}

// Map a backend user (+ optional company profile) to the UI User shape.
function toUser(apiUser: any, company?: any): User {
  const isManager = !!(apiUser?.is_manager || apiUser?.is_staff || apiUser?.is_company);
  return {
    id: String(apiUser?.id ?? ""),
    company_name: company?.company_name || "",
    manager_full_name: company?.manager_full_name || apiUser?.username || "",
    email: apiUser?.email || "",
    phone: company?.phone || "",
    address: company?.address || "",
    password: "",
    role: apiUser?.is_staff ? "Admin" : "Manager",
    is_staff: !!apiUser?.is_staff,
    is_manager: isManager,
    profile_photo: company?.profile_photo || undefined,
    date_joined: company?.date_joined || new Date().toISOString(),
  };
}

async function fetchCompanyProfile(access: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/accounts/company/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export interface RegisterInput {
  company_name: string;
  manager_full_name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export async function register(input: RegisterInput): Promise<void> {
  const email = input.email.trim().toLowerCase();
  const res = await fetch(`${API_BASE_URL}/api/accounts/register/company/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: { username: email, email, password: input.password },
      company_name: input.company_name.trim(),
      manager_full_name: input.manager_full_name.trim(),
      phone: input.phone.trim(),
      address: input.address?.trim() || "",
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = data?.errors?.user
      ? Object.values(data.errors.user)[0]
      : data?.detail;
    throw new Error((err as string) || "Registration failed.");
  }
}

export async function login(identifier: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: identifier.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Login failed.");

  if (isBrowser()) {
    window.localStorage.setItem(ACCESS_KEY, data.access);
    window.localStorage.setItem(REFRESH_KEY, data.refresh);
    setCookie(ACCESS_KEY, data.access);
  }
  const company = await fetchCompanyProfile(data.access);
  const user = toUser(data.user, company);
  if (isBrowser()) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  emit();
  return user;
}

export function logout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  clearCookie(ACCESS_KEY);
  emit();
}

export function isAuthenticated(): boolean {
  if (!isBrowser()) return false;
  return !!window.localStorage.getItem(ACCESS_KEY);
}

export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// Best-effort profile update: patch the backend company profile and refresh
// the locally cached user.
export async function updateProfile(patch: Partial<User>) {
  if (!isBrowser()) return;
  const access = window.localStorage.getItem(ACCESS_KEY);
  const current = getCurrentUser();
  const merged = { ...(current || {}), ...patch } as User;
  window.localStorage.setItem(USER_KEY, JSON.stringify(merged));
  emit();
  if (access) {
    try {
      await fetch(`${API_BASE_URL}/api/accounts/company/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          company_name: patch.company_name,
          manager_full_name: patch.manager_full_name,
          phone: patch.phone,
          address: patch.address,
        }),
      });
    } catch {
      /* keep local update even if the network call fails */
    }
  }
}

export function useAuth(): { user: User | null; ready: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY || e.key === ACCESS_KEY) sync();
    };
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { user, ready };
}
