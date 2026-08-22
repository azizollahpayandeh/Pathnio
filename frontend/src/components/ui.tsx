"use client";

import React, { useEffect, useRef } from "react";
import { useT } from "@/i18n";
import type { LucideIcon } from "lucide-react";

// Small, shared UI primitives that give every page a consistent, polished look.

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  gradient = "from-violet-500 to-purple-600",
  actions,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  gradient?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-brand`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 text-sm sm:text-base mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  gradient = "from-violet-500 to-purple-600",
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  gradient?: string;
  hint?: string;
}) {
  return (
    <div className="card card-hover p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 shrink-0 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-md`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-900 leading-tight truncate">
          {value}
        </div>
        <div className="text-sm text-slate-500 truncate">{label}</div>
        {hint && <div className="text-xs text-emerald-600 font-medium mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
  blue: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  indigo: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  cyan: "bg-teal-50 text-teal-700 border-teal-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

export function Badge({
  tone = "gray",
  children,
  icon: Icon,
}: {
  tone?: keyof typeof badgeTones | string;
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <span className={`badge ${badgeTones[tone] || badgeTones.gray}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

export function Spinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner className="w-10 h-10" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-slate-500 mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  gradient = "from-violet-500 to-purple-600",
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const tr = useT();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Close on Escape, focus the dialog on open, and return focus to whatever
  // triggered it on close — basic modal accessibility without a full
  // focus-trap library.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`card-glass w-full ${maxWidth} max-h-[92vh] overflow-y-auto scroll-slim animate-fade-in-up outline-none`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 p-6 border-b border-slate-100">
          {Icon && (
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
            aria-label={tr("ui.close")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500 ms-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
