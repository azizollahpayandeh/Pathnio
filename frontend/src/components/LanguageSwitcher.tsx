"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n, type LocaleCode } from "@/i18n";
import { toast } from "./Toast";

/**
 * Language picker. The choice is written to the user's account (and mirrored
 * locally), so it persists across logout/login and devices, and is shared by
 * the public site and the dashboard.
 *
 * `variant="onDark"` renders for the translucent public navbar.
 */
const FLAG: Record<string, string> = { en: "🇬🇧", fa: "🇮🇷", de: "🇩🇪", it: "🇮🇹" };

export default function LanguageSwitcher({
  compact = false,
  variant = "default",
}: {
  compact?: boolean;
  variant?: "default" | "onDark";
}) {
  const { locale, setLocale, available, t } = useI18n();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = async (code: string) => {
    setOpen(false);
    if (code === locale) return;
    await setLocale(code as LocaleCode);
    toast.success(t("settings.languageSaved"));
  };

  const current = available.find((l) => l.code === locale);

  const trigger =
    variant === "onDark"
      ? "bg-white/15 hover:bg-white/25 text-white border border-white/20"
      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent";

  return (
    <div ref={box} className={`relative ${compact ? "" : "w-full max-w-xs"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        className={`flex items-center gap-2 rounded-xl font-semibold transition-all ${trigger} ${
          compact ? "px-3 py-2 text-sm" : "px-4 py-3 w-full justify-between"
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {compact ? (
            <span className="text-base leading-none">{FLAG[locale] ?? "🌐"}</span>
          ) : (
            <Globe className="w-4 h-4 shrink-0 opacity-70" />
          )}
          <span className="truncate">{current?.label ?? locale}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-48 end-0 rounded-2xl bg-white shadow-xl border border-slate-100 p-1.5 animate-fade-in"
        >
          {available.map((l) => {
            const active = l.code === locale;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(l.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base leading-none">{FLAG[l.code] ?? "🌐"}</span>
                  <span className="flex-1 text-start truncate">{l.label}</span>
                  {active && <Check className="w-4 h-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
