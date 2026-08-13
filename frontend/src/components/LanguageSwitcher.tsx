"use client";
import { Languages } from "lucide-react";
import { useI18n, type LocaleCode } from "@/i18n";
import { toast } from "./Toast";

/**
 * Language picker. Writes the choice to the user's account (and a local
 * mirror), so it persists across logout/login and devices.
 */
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, available, t } = useI18n();

  const onChange = async (code: string) => {
    await setLocale(code as LocaleCode);
    toast.success(t("settings.languageSaved"));
  };

  if (compact) {
    return (
      <select
        aria-label={t("common.language")}
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
      >
        {available.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Languages className="w-5 h-5 text-violet-600" />
        <h2 className="font-bold text-slate-800">{t("settings.languageTitle")}</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">{t("settings.languageHint")}</p>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="field w-full max-w-xs"
      >
        {available.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
