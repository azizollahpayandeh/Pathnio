"use client";

import { useEffect, useState } from "react";
import type { User } from "./types";
import { getAll, insert, update, uid, subscribe, findById } from "./store";

// Client-side demo authentication. Credentials live in the local store; a
// lightweight session token is kept in localStorage + a cookie so the Next.js
// middleware can gate the auth routes. This keeps the deployed demo fully
// functional without depending on a server that can't persist on serverless.

const SESSION_KEY = "pathnio_session";
const TOKEN_KEY = "access";
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

export interface RegisterInput {
  company_name: string;
  manager_full_name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export function register(input: RegisterInput): User {
  const email = input.email.trim().toLowerCase();
  const exists = getAll("users").some((u) => u.email.toLowerCase() === email);
  if (exists) {
    throw new Error("An account with this email already exists.");
  }
  const user: User = {
    id: uid("user"),
    company_name: input.company_name.trim(),
    manager_full_name: input.manager_full_name.trim(),
    email,
    phone: input.phone.trim(),
    address: input.address?.trim() || "",
    password: input.password,
    role: "Manager",
    is_staff: false,
    is_manager: true,
    date_joined: new Date().toISOString(),
  };
  insert("users", user);
  return user;
}

export function login(email: string, password: string): User {
  const id = email.trim().toLowerCase();
  const user = getAll("users").find(
    (u) => u.email.toLowerCase() === id || u.company_name.toLowerCase() === id
  );
  if (!user) throw new Error("No account found with this email.");
  if (user.password !== password) throw new Error("Incorrect password. Please try again.");
  startSession(user);
  return user;
}

function startSession(user: User) {
  if (!isBrowser()) return;
  const token = `demo.${user.id}.${Date.now().toString(36)}`;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(SESSION_KEY, user.id);
  window.localStorage.setItem("user", JSON.stringify(safeUser(user)));
  setCookie(TOKEN_KEY, token);
  emit();
}

export function logout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("refresh");
  clearCookie(TOKEN_KEY);
  emit();
}

export function isAuthenticated(): boolean {
  if (!isBrowser()) return false;
  return !!window.localStorage.getItem(TOKEN_KEY) && !!currentUserId();
}

function currentUserId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(SESSION_KEY);
}

// Strip the password before exposing a user to the UI layer.
function safeUser(u: User): User {
  return { ...u, password: "" };
}

export function getCurrentUser(): User | null {
  const id = currentUserId();
  if (!id) return null;
  const u = findById("users", id);
  return u ? safeUser(u) : null;
}

export function updateProfile(patch: Partial<User>) {
  const id = currentUserId();
  if (!id) return;
  const clean = { ...patch };
  delete clean.id;
  update("users", id, clean);
  const u = findById("users", id);
  if (u && isBrowser()) {
    window.localStorage.setItem("user", JSON.stringify(safeUser(u)));
    emit();
  }
}

export function useAuth(): { user: User | null; ready: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    setReady(true);
    const off = subscribe(sync);
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      off();
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, []);

  return { user, ready };
}
