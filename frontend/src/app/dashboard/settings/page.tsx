"use client";
import { useState } from "react";
import {
  Settings as SettingsIcon, Globe, Bell, Mail, Palette,
  RefreshCw, Check, Database,
} from "lucide-react";
import FloatingAlert from "@/components/FloatingAlert";
import { PageHeader } from "@/components/ui";
import { useSettings, resetDatabase } from "@/lib/store";

const COLORS = ["#2563eb", "#7c3aed", "#0d9488", "#ea580c", "#e11d48", "#0284c7"];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? "bg-blue-600" : "bg-slate-300"}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Row({ icon: Icon, title, desc, children }: { icon: typeof Bell; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"><Icon className="w-5 h-5" /></span>
        <div className="min-w-0">
          <div className="font-semibold text-slate-800">{title}</div>
          <div className="text-sm text-slate-500">{desc}</div>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, save] = useSettings();
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const notify = (msg: string) => {
    setAlert({ type: "success", msg });
    setTimeout(() => setAlert(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Personalize your workspace" gradient="from-slate-500 to-slate-700" />

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-2">Preferences</h2>
        <Row icon={Globe} title="Language" desc="Interface language">
          <select className="field w-40" value={settings.language} onChange={(e) => { save({ language: e.target.value as "en" | "fa" }); notify("Language updated."); }}>
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>
        </Row>
        <Row icon={Palette} title="Accent color" desc="Primary brand color">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { save({ primary_color: c }); notify("Accent updated."); }}
                className="w-7 h-7 rounded-full ring-2 ring-offset-2 transition"
                style={{ background: c, boxShadow: settings.primary_color === c ? `0 0 0 2px ${c}` : "none" } as React.CSSProperties}
                aria-label={c}
              >
                {settings.primary_color === c && <Check className="w-4 h-4 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </Row>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-2">Notifications</h2>
        <Row icon={Mail} title="Email notifications" desc="Receive fleet summaries by email">
          <Toggle checked={settings.email_notifications} onChange={() => { save({ email_notifications: !settings.email_notifications }); notify("Saved."); }} />
        </Row>
        <Row icon={Bell} title="Push notifications" desc="Real-time alerts in your browser">
          <Toggle checked={settings.push_notifications} onChange={() => { save({ push_notifications: !settings.push_notifications }); notify("Saved."); }} />
        </Row>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2"><Database className="w-5 h-5 text-slate-500" /> Demo data</h2>
        <p className="text-sm text-slate-500 mb-4">Restore the sample fleet, drivers, trips and expenses to their original state.</p>
        <button
          onClick={() => { resetDatabase(); notify("Demo data restored."); }}
          className="btn btn-ghost"
        >
          <RefreshCw className="w-4 h-4" /> Reset demo data
        </button>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
