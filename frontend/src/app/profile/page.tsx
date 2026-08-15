"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, ArrowLeft, Camera, Mail, Phone, MapPin,
  Building2, Calendar, Shield, Save, LogOut, Lock, KeyRound,
} from "lucide-react";
import FloatingAlert from "@/components/FloatingAlert";
import { useAuth, updateProfile, logout } from "@/lib/auth";
import { Field } from "@/components/ui";
import { useT } from "@/i18n";

export default function ProfilePage() {
  const tr = useT();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({ company_name: "", manager_full_name: "", email: "", phone: "", address: "" });
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (ready && !user) router.push("/login");
    if (user) {
      setForm({
        company_name: user.company_name,
        manager_full_name: user.manager_full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
      setPhoto(user.profile_photo);
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  if (!ready || !user) return null;

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPhoto(url);
      updateProfile({ profile_photo: url });
      setAlert({ type: "success", msg: "Photo updated." });
    };
    reader.readAsDataURL(file);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setAlert({ type: "success", msg: "Profile saved successfully." });
  };

  const initial = (form.company_name || form.manager_full_name || "P").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => router.push("/dashboard")} className="btn btn-ghost">
          <ArrowLeft className="w-4 h-4" /> {tr("ui.back_to_dashboard")}
        </button>

        {/* Header card */}
        <div className="card overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-violet-600 via-purple-600 to-purple-600" />
          <div className="px-6 sm:px-8 pb-6 -mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-lg">
                  {photo ? (
                    <img src={photo} alt="Avatar" className="w-full h-full rounded-[1.35rem] object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-[1.35rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white text-4xl font-bold flex items-center justify-center">
                      {initial}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center cursor-pointer shadow-md transition">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{form.company_name || tr("ui.your_company_fallback")}</h1>
                <p className="text-slate-500 flex items-center gap-1.5"><UserIcon className="w-4 h-4" />{form.manager_full_name}</p>
              </div>
              <span className="badge bg-violet-50 text-violet-700 border-violet-200 self-start sm:self-auto">
                <Shield className="w-3.5 h-3.5" /> {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={save} className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-violet-600" /> {tr("ui.company_details")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={tr("ui.company_name")}><input className="field" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></Field>
            <Field label={tr("ui.manager_full_name")}><input className="field" value={form.manager_full_name} onChange={(e) => set("manager_full_name", e.target.value)} /></Field>
            <Field label={tr("ui.email")}><div className="relative"><Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input className="field ps-10" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div></Field>
            <Field label={tr("ui.phone")}><div className="relative"><Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input className="field ps-10" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div></Field>
            <div className="sm:col-span-2">
              <Field label={tr("ui.address")}><div className="relative"><MapPin className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input className="field ps-10" value={form.address} onChange={(e) => set("address", e.target.value)} /></div></Field>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn btn-primary"><Save className="w-4 h-4" /> {tr("ui.save_changes")}</button>
            <span className="text-sm text-slate-400 flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(user.date_joined).toLocaleDateString()}</span>
          </div>
        </form>

        {/* Security */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-violet-600" /> {tr("ui.security")}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setAlert({ type: "success", msg: "In the demo, passwords are managed locally." })}
              className="btn btn-ghost flex-1"
            >
              <KeyRound className="w-4 h-4" /> {tr("ui.change_password")}
            </button>
            <button onClick={() => { logout(); router.push("/login"); }} className="btn flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100">
              <LogOut className="w-4 h-4" /> {tr("ui.sign_out")}
            </button>
          </div>
        </div>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
