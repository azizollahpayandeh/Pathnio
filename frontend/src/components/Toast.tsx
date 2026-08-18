"use client";

// A tiny, dependency-free global toast system.
// Call `toast.success(msg)` / `toast.error(msg)` / `toast.info(msg)` from
// anywhere (pages, hooks, CRUD helpers). <ToastHost/> (mounted once in the
// dashboard layout) listens for the event and renders the stack.
//
// This is the single, standard user-facing notification channel for CRUD
// success/error. Technical details belong in console/dev logs, never here.

import { useEffect, useState } from "react";
import { useT } from "@/i18n";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info";
export type ToastItem = { id: number; kind: ToastKind; message: string };

const EVENT = "pathnio:toast";

function emit(kind: ToastKind, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { kind, message } }));
}

/** Turn an axios/unknown error into a short, human message (never a stack trace). */
export function toMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;
  const status = anyErr?.response?.status;
  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (data) {
    if (typeof data === "string") return data.slice(0, 200);
    if (data.detail) return String(data.detail);
    // DRF field errors: {"plate_number": ["vehicle with this plate number already exists."]}
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      const msg = Array.isArray(val) ? val[0] : val;
      const label = firstKey === "non_field_errors" ? "" : `${firstKey.replace(/_/g, " ")}: `;
      return `${label}${msg}`;
    }
  }
  if (status >= 500) return "Server error. Please try again in a moment.";
  return fallback;
}

export const toast = {
  success: (m: string) => emit("success", m),
  error: (m: string) => emit("error", m),
  info: (m: string) => emit("info", m),
  /** Convenience: show a friendly message extracted from an error object. */
  fromError: (err: unknown, fallback?: string) => emit("error", toMessage(err, fallback)),
};

const STYLES: Record<ToastKind, { icon: typeof Info; ring: string; text: string; bar: string }> = {
  success: { icon: CheckCircle2, ring: "border-emerald-200 bg-emerald-50", text: "text-emerald-800", bar: "bg-emerald-500" },
  error: { icon: AlertCircle, ring: "border-rose-200 bg-rose-50", text: "text-rose-800", bar: "bg-rose-500" },
  info: { icon: Info, ring: "border-blue-200 bg-blue-50", text: "text-blue-800", bar: "bg-blue-500" },
};

export function ToastHost() {
  const tr = useT();
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e: Event) => {
      const { kind, message } = (e as CustomEvent).detail as { kind: ToastKind; message: string };
      const id = ++counter + Date.now();
      setItems((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 5000);
    };
    window.addEventListener(EVENT, onToast as EventListener);
    return () => window.removeEventListener(EVENT, onToast as EventListener);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full max-w-md px-4 pointer-events-none">
      {items.map((t) => {
        const s = STYLES[t.kind];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto w-full flex items-start gap-3 rounded-2xl border ${s.ring} ${s.text} shadow-lg px-4 py-3 animate-fade-in overflow-hidden relative`}
          >
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="shrink-0 opacity-60 hover:opacity-100 transition"
              aria-label={tr("ui.dismiss")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
