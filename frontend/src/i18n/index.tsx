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

import { LOCALE_COOKIE, DEFAULT_LOCALE, LOCALE_META, type LocaleCode } from "./config";
export { LOCALE_COOKIE, DEFAULT_LOCALE } from "./config";
export type { LocaleCode } from "./config";

type Catalogue = Record<string, unknown>;

/** Register a language here (plus its JSON file) — nothing else to change. */
const CATALOGUES: Record<string, Catalogue> = { en: en as Catalogue, fa: fa as Catalogue };

export const LOCALES: Record<
  string,
  { label: string; dir: "ltr" | "rtl"; messages: Catalogue }
> = Object.fromEntries(
  Object.entries(LOCALE_META)
    .filter(([code]) => CATALOGUES[code])
    .map(([code, meta]) => [code, { ...meta, messages: CATALOGUES[code] }])
);

const STORAGE_KEY = "pathnio_locale";
// A choice made while signed out, to be adopted into the account on sign-in.
const PENDING_KEY = "pathnio_locale_pending";

/** Mirror the choice into a cookie so the server can render the right
 *  lang/dir on the very first paint (no flash of the wrong language). */
function writeLocaleCookie(code: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
}

function readCookieLocale(): LocaleCode | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  const v = m?.[1] as LocaleCode | undefined;
  return v && LOCALES[v] ? v : null;
}

/** Resolve the starting locale synchronously so the first client render is
 *  already correct — an async effect here caused the UI to render in English
 *  even though the stored preference was Persian. */
function readInitialLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
  if (stored && LOCALES[stored]) return stored;
  return readCookieLocale() ?? DEFAULT_LOCALE;
}

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

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  /** Resolved on the SERVER from the language cookie, so the first paint is
   *  already in the right language and hydration matches exactly. */
  initialLocale?: LocaleCode;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(
    () => initialLocale ?? readInitialLocale()
  );
  const [ready, setReady] = useState(false);

  /**
   * Reconcile the local choice with the account.
   *  - signed out: whatever is cached locally simply stands.
   *  - signed in: a language picked BEFORE signing in (e.g. on the login
   *    screen) is the user's latest explicit choice, so it is pushed up;
   *    otherwise the account value wins, which is what makes the preference
   *    follow the user onto a new device.
   */
  const sync = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem("access")) {
      setReady(true);
      return;
    }
    try {
      const r = await api.get("accounts/preferences/");
      const server = r.data?.language as LocaleCode | undefined;
      const pending = window.localStorage.getItem(PENDING_KEY) as LocaleCode | null;

      if (pending && LOCALES[pending] && pending !== server) {
        await api.patch("accounts/preferences/", { language: pending });
        window.localStorage.removeItem(PENDING_KEY);
        setLocaleState(pending);
        window.localStorage.setItem(STORAGE_KEY, pending);
        writeLocaleCookie(pending);
      } else if (server && LOCALES[server]) {
        window.localStorage.removeItem(PENDING_KEY);
        setLocaleState(server);
        window.localStorage.setItem(STORAGE_KEY, server);
        writeLocaleCookie(server);
      }
    } catch {
      /* offline — the cached value stands and re-syncs next load */
    } finally {
      setReady(true);
    }
  }, []);

  // One-time migration: users who chose a language before cookies were used
  // still have it only in localStorage. Adopt it and write the cookie so every
  // later request is server-rendered in the right language.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (readCookieLocale()) return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (stored && LOCALES[stored]) {
      writeLocaleCookie(stored);
      if (stored !== locale) setLocaleState(stored);
    }
  }, []);

  // Run on mount AND whenever auth changes, so signing in adopts the account
  // language (or uploads a pre-login choice) without a page reload.
  useEffect(() => {
    sync();
    if (typeof window === "undefined") return;
    const onAuth = () => sync();
    window.addEventListener("pathnio:auth", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("pathnio:auth", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [sync]);

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
      writeLocaleCookie(code);
      // Persist to the account so it survives logout/login and other devices.
      if (window.localStorage.getItem("access")) {
        try {
          await api.patch("accounts/preferences/", { language: code });
          window.localStorage.removeItem(PENDING_KEY);
        } catch {
          /* keep the local change; it re-syncs on next load */
        }
      } else {
        // Chosen before signing in — adopt it into the account at sign-in.
        window.localStorage.setItem(PENDING_KEY, code);
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

/**
 * Translate a value that comes from the API (status, category, type…).
 * Data itself is never translated — only these known enum labels are, via
 * `ui.val_<lowercased value>` with a fallback to the raw value.
 */
export function useTValue() {
  const { t } = useI18n();
  return (value?: string | null) => {
    if (!value) return "";
    const key = `ui.val_${String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
    const hit = t(key);
    return hit === key ? String(value) : hit;
  };
}
