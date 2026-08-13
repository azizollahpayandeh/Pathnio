"use client";
/**
 * Pathnio localization.
 *
 * Design goals:
 *  - No translated strings inside components: every component calls t("a.b").
 *  - Adding a language = drop in `locales/<code>.json` + one LOCALES entry.
 *    No component changes, no rewrites.
 *  - Direction (LTR/RTL) is derived from the locale, so RTL languages work
 *    without per-component branching.
 *  - The chosen language is persisted on the USER ACCOUNT (backend) so it
 *    survives logout/login and follows the user to other devices, with a
 *    localStorage mirror purely so the first paint isn't wrong.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "@/app/api";
import en from "./locales/en.json";
import fa from "./locales/fa.json";

export type LocaleCode = "en" | "fa" | "de" | "it";

type Catalogue = Record<string, unknown>;

/** Register a language here (plus its JSON file) — nothing else to change. */
export const LOCALES: Record<
  string,
  { label: string; dir: "ltr" | "rtl"; messages: Catalogue }
> = {
  en: { label: "English", dir: "ltr", messages: en as Catalogue },
  fa: { label: "فارسی", dir: "rtl", messages: fa as Catalogue },
};

export const DEFAULT_LOCALE: LocaleCode = "en";
const STORAGE_KEY = "pathnio_locale";

function lookup(messages: Catalogue, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) =>
      acc && typeof acc === "object" ? (acc as Catalogue)[part] : undefined,
      messages);
  return typeof value === "string" ? value : undefined;
}

/** Replace {placeholders} with supplied values. */
function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m
  );
}

type Ctx = {
  locale: LocaleCode;
  dir: "ltr" | "rtl";
  setLocale: (code: LocaleCode) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  available: { code: string; label: string }[];
  ready: boolean;
};

const I18nContext = createContext<Ctx | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  // 1) instant paint from the local mirror, 2) then trust the account value.
  useEffect(() => {
    const cached = (typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY)) as LocaleCode | null;
    if (cached && LOCALES[cached]) setLocaleState(cached);

    (async () => {
      try {
        if (typeof window !== "undefined" && window.localStorage.getItem("access")) {
          const r = await api.get("accounts/preferences/");
          const server = r.data?.language as LocaleCode | undefined;
          if (server && LOCALES[server]) {
            setLocaleState(server);
            window.localStorage.setItem(STORAGE_KEY, server);
          }
        }
      } catch {
        /* not signed in / offline — the cached value stands */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Keep <html lang/dir> in sync so RTL applies to the whole document.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const dir = LOCALES[locale]?.dir ?? "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback(async (code: LocaleCode) => {
    if (!LOCALES[code]) return;
    setLocaleState(code);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, code);
      // Persist to the account so it survives logout/login and other devices.
      if (window.localStorage.getItem("access")) {
        try {
          await api.patch("accounts/preferences/", { language: code });
        } catch {
          /* keep the local change; it re-syncs on next load */
        }
      }
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const active = LOCALES[locale]?.messages ?? LOCALES[DEFAULT_LOCALE].messages;
      const hit =
        lookup(active, key) ??
        lookup(LOCALES[DEFAULT_LOCALE].messages, key); // graceful fallback
      return interpolate(hit ?? key, vars);
    },
    [locale]
  );

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir: LOCALES[locale]?.dir ?? "ltr",
      setLocale,
      t,
      available: Object.entries(LOCALES).map(([code, v]) => ({
        code,
        label: v.label,
      })),
      ready,
    }),
    [locale, setLocale, t, ready]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Convenience: const t = useT(); t("nav.dashboard") */
export function useT() {
  return useI18n().t;
}
