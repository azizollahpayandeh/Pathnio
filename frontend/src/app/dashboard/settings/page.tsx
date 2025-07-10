"use client";
import { useEffect, useState } from "react";
import api from "../../api";
import FloatingAlert from "@/components/FloatingAlert";

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "Farsi" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({ theme: "light", language: "en" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    api.get("accounts/site-settings/")
      .then(res => setSettings(res.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load settings." }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: any) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      await api.patch("accounts/site-settings/", settings);
      setAlert({ type: "success", msg: "Settings saved successfully!" });
    } catch {
      setAlert({ type: "error", msg: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-xl mx-auto mt-10 w-full">
      <h1 className="font-extrabold text-3xl mb-8 text-blue-700">Website Settings</h1>
      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
      {loading ? (
        <div className="text-blue-400 animate-pulse text-lg">Loading settings...</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-fade-in">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-blue-900 text-base shadow-sm"
            >
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              name="language"
              value={settings.language}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-blue-900 text-base shadow-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer mt-2 text-lg"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 