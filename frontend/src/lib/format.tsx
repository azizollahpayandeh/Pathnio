"use client";
/**
 * Company-aware formatting.
 *
 * Money and distance follow the company's saved Settings (currency +
 * distance_unit) instead of hardcoded "€" and "km", and numbers are rendered
 * with the active locale so Persian gets Persian digits.
 *
 * Settings are fetched once and cached in a module-level promise, so every
 * component shares a single request.
 */
import { useEffect, useState } from "react";
import api from "@/app/api";
import { useI18n } from "@/i18n";

export type UnitSettings = { currency: string; distance_unit: "km" | "mi" };

const FALLBACK: UnitSettings = { currency: "EUR", distance_unit: "km" };
let cache: Promise<UnitSettings> | null = null;

function load(): Promise<UnitSettings> {
  if (!cache) {
    cache = api
      .get("accounts/company/settings/")
      .then((r) => ({
        currency: r.data?.currency || FALLBACK.currency,
        distance_unit: (r.data?.distance_unit as "km" | "mi") || FALLBACK.distance_unit,
      }))
      .catch(() => FALLBACK);
  }
  return cache;
}

/** Call after saving settings so every formatter picks up the new values. */
export function invalidateUnits() {
  cache = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pathnio:units"));
  }
}

const SYMBOL: Record<string, string> = {
  EUR: "€", USD: "$", GBP: "£", IRR: "﷼", AED: "د.إ", TRY: "₺",
};

export function useUnits() {
  const { locale } = useI18n();
  const [u, setU] = useState<UnitSettings>(FALLBACK);

  useEffect(() => {
    let alive = true;
    const pull = () => load().then((v) => alive && setU(v));
    pull();
    const onChange = () => pull();
    window.addEventListener("pathnio:units", onChange);
    return () => {
      alive = false;
      window.removeEventListener("pathnio:units", onChange);
    };
  }, []);

  const nf = (opts?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale, opts);

  /** Money in the company's configured currency. */
  const currency = (n: number, digits = 0) => {
    const sym = SYMBOL[u.currency] ?? u.currency;
    const value = nf({
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number(n) || 0);
    return `${sym}${value}`;
  };

  /** Distance converted to the company's configured unit. */
  const distance = (km: number) => {
    const v = u.distance_unit === "mi" ? (Number(km) || 0) * 0.621371 : Number(km) || 0;
    const unit = u.distance_unit === "mi" ? "mi" : "km";
    return `${nf({ maximumFractionDigits: 0 }).format(v)} ${unit}`;
  };

  /** Speed in the matching unit. */
  const speed = (kmh: number) => {
    const v = u.distance_unit === "mi" ? (Number(kmh) || 0) * 0.621371 : Number(kmh) || 0;
    const unit = u.distance_unit === "mi" ? "mph" : "km/h";
    return `${nf({ maximumFractionDigits: 0 }).format(v)} ${unit}`;
  };

  const number = (n: number) => nf().format(Number(n) || 0);

  return { ...u, currency, distance, speed, number };
}
