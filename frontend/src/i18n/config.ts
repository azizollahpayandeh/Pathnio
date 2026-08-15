/**
 * Locale configuration shared by SERVER and CLIENT.
 *
 * This file must NOT be a client module: the root layout (a server component)
 * reads the language cookie through it. Importing these constants from the
 * "use client" provider gave the server a client proxy instead of the real
 * values, so the cookie was never resolved and every page rendered in English.
 */
export type LocaleCode = "en" | "fa" | "de" | "it";

export const LOCALE_COOKIE = "pathnio_lang";
export const DEFAULT_LOCALE: LocaleCode = "en";

/** Register a language here (plus its JSON catalogue) — nothing else changes. */
export const LOCALE_META: Record<string, { label: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", dir: "ltr" },
  fa: { label: "فارسی", dir: "rtl" },
};

export function isSupported(code?: string | null): code is LocaleCode {
  return !!code && code in LOCALE_META;
}

export function dirOf(code?: string | null): "ltr" | "rtl" {
  return (isSupported(code) && LOCALE_META[code].dir) || "ltr";
}
