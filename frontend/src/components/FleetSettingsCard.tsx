"use client";
import { useEffect, useState } from "react";
import { invalidateUnits } from "@/lib/format";
import { Gauge, Save } from "lucide-react";
import { getCompanySettings, updateCompanySettings, type CompanySettings } from "@/lib/api-data";
import { toast } from "./Toast";
import { useT } from "@/i18n";

export default function FleetSettingsCard() {
  const tr = useT();
  const [s, setS] = useState<CompanySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getCompanySettings().then(setS).catch(() => setS(null));
  }, []);

  if (!s) {
    return (
      <div className="card p-6 text-slate-400 text-sm">{tr("ui.loading_fleet_settings")}</div>
    );
  }

  const set = (k: keyof CompanySettings, v: string | number) => setS({ ...s, [k]: v });
  const num = (k: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value));

  const save = async () => {
    // Client-side guard rails; the server validates authoritatively.
    if (s.offline_timeout_seconds < 10 || s.telemetry_interval_seconds < 5 || s.moving_speed_kmh < 0) {
      toast.error("Please enter valid thresholds (offline ≥ 10s, telemetry ≥ 5s, speed ≥ 0).");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const next = await updateCompanySettings(s);
      setS(next);
      setMsg(tr("ui.saved"));
      invalidateUnits();
      toast.success(tr("ui.fleet_settings_saved"));
      setTimeout(() => setMsg(null), 2000);
    } catch (err) {
      toast.fromError(err, tr("ui.could_not_save_settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-white" />
        </span>
        <h2 className="font-bold text-slate-800">Fleet &amp; tracking settings</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">{tr("ui.timezone")}</label>
          <input className="field w-full" value={s.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="UTC" />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">{tr("ui.distance_unit")}</label>
          <select className="field w-full" value={s.distance_unit} onChange={(e) => set("distance_unit", e.target.value)}>
            <option value="km">{tr("ui.kilometers")}</option>
            <option value="mi">{tr("ui.miles")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">{tr("ui.currency")}</label>
          <input className="field w-full" value={s.currency} onChange={(e) => set("currency", e.target.value)} placeholder="EUR" />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">{tr("ui.moving_speed_threshold_km_h")}</label>
          <input type="number" min={0} className="field w-full" value={s.moving_speed_kmh} onChange={num("moving_speed_kmh")} />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">{tr("ui.offline_timeout_seconds")}</label>
          <input type="number" min={10} className="field w-full" value={s.offline_timeout_seconds} onChange={num("offline_timeout_seconds")} />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">{tr("ui.telemetry_interval_seconds")}</label>
          <input type="number" min={5} className="field w-full" value={s.telemetry_interval_seconds} onChange={num("telemetry_interval_seconds")} />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button onClick={save} disabled={saving} className="btn btn-primary">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save settings"}
        </button>
        {msg && <span className="text-sm text-emerald-600">{msg}</span>}
      </div>
    </div>
  );
}
