"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FloatingAlert from "@/components/FloatingAlert";
import { Lock, Truck, ArrowRight, Sparkles } from "lucide-react";
import { register, login, isAuthenticated } from "@/lib/auth";
import { useT } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const companyFields = [
  { label: "Company Name", name: "companyName", required: true, placeholder: "Acme Logistics" },
  { label: "Full Name", name: "fullName", required: true, placeholder: "Your full name" },
  { label: "Phone Number", name: "phone", required: true, placeholder: "+49 151 000 000" },
  { label: "Email", name: "email", required: true, placeholder: "you@company.com", type: "email" },
  { label: "Password", name: "password", required: true, placeholder: "At least 6 characters", type: "password" },
  { label: "Head Office Address", name: "address", required: false, placeholder: "City, Country" },
];

export default function LoginPage() {
  const tr = useT();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.push("/dashboard");
  }, [router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const password = fd.get("password") as string;
      if (password.length < 6) throw new Error(tr("ui.password_must_be_at_least_6_characters"));
      await register({
        company_name: fd.get("companyName") as string,
        manager_full_name: fd.get("fullName") as string,
        phone: fd.get("phone") as string,
        email: fd.get("email") as string,
        password,
        address: (fd.get("address") as string) || "",
      });
      setAlert({ type: "success", msg: "Account created! Signing you in…" });
      await login(fd.get("email") as string, password);
      router.push("/dashboard");
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Registration failed." });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await login(fd.get("login-username") as string, fd.get("login-password") as string);
      setAlert({ type: "success", msg: "Welcome back! Redirecting…" });
      router.push("/dashboard");
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Login failed." });
    } finally {
      setLoginLoading(false);
    }
  };

  const fillDemo = () => {
    setTab("login");
    setTimeout(() => {
      (document.getElementById("login-username") as HTMLInputElement).value = "manager@pathnio.demo";
      (document.getElementById("login-password") as HTMLInputElement).value = "Pathnio#Manager1";
    }, 0);
  };

  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alert]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-violet-800 to-purple-900 p-12 text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-400/30 rounded-full blur-3xl animate-floaty" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-purple-500/30 rounded-full blur-3xl" />
        <Link href="/" className="relative z-10 flex items-center gap-3 font-extrabold text-2xl tracking-widest">
          <span className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-glow">
            <Truck className="w-6 h-6" />
          </span>
          Pathnio
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            {tr("auth.runFleet")}
          </h1>
          <p className="text-violet-100/90 text-lg">
            {tr("auth.realtimeTagline")}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[["12+", "Vehicles"], ["10", "Drivers"], ["98%", "On-time"]].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/10">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-sm text-violet-100/80">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-violet-200/70 text-sm">© {new Date().getFullYear()} Pathnio. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-[var(--background)]">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-3"><LanguageSwitcher compact /></div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-brand mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="flex p-1 bg-slate-100 rounded-2xl w-full max-w-xs">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 px-6 py-2.5 rounded-xl font-semibold capitalize transition-all ${
                    tab === t ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "login" ? (
            <form className="space-y-5 animate-fade-in-up" onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold text-slate-900 text-center">{tr("auth.welcomeBack")}</h2>
              <p className="text-center text-slate-500 -mt-2 text-sm">{tr("auth.signInSubtitle")}</p>
              <div>
                <label htmlFor="login-username" className="block mb-1.5 text-sm font-semibold text-slate-700">{tr("auth.email")}</label>
                <input id="login-username" name="login-username" type="email" required className="field" placeholder="you@company.com" defaultValue="" />
              </div>
              <div>
                <label htmlFor="login-password" className="block mb-1.5 text-sm font-semibold text-slate-700">{tr("auth.password")}</label>
                <input id="login-password" name="login-password" type="password" required className="field" placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-primary w-full text-lg" disabled={loginLoading}>
                {loginLoading ? tr("common.signingIn") : (<>{tr("common.signIn")} <ArrowRight className="w-5 h-5" /></>)}
              </button>
              <button type="button" onClick={fillDemo} className="w-full flex items-center justify-center gap-2 text-sm text-violet-600 font-medium hover:text-violet-800 transition">
                <Sparkles className="w-4 h-4" /> {tr("ui.use_demo_account")}
              </button>
            </form>
          ) : (
            <form className="space-y-4 animate-fade-in-up" onSubmit={handleRegister}>
              <h2 className="text-2xl font-bold text-slate-900 text-center">{tr("ui.create_your_company")}</h2>
              <p className="text-center text-slate-500 -mt-1 text-sm mb-2">{tr("ui.start_managing_your_fleet_in_seconds")}</p>
              {companyFields.map((f) => (
                <div key={f.name}>
                  <label htmlFor={f.name} className="block mb-1.5 text-sm font-semibold text-slate-700">
                    {f.label}{f.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </label>
                  <input id={f.name} name={f.name} type={f.type || "text"} required={f.required} className="field" placeholder={f.placeholder} />
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-full text-lg" disabled={registerLoading}>
                {registerLoading ? "Creating…" : (<>{tr("ui.create_account")} <ArrowRight className="w-5 h-5" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
