"use client";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useT } from "@/i18n";
import {
  MapPin, BarChart3, UserCheck, ArrowRight, Truck, Route,
  Wallet, Bell, ShieldCheck, Zap, Gauge, Star,
} from "lucide-react";

const FEATURES = [
  { icon: MapPin, title: "Real-Time GPS", desc: "Track every vehicle live on an interactive map with accurate positioning.", tone: "from-emerald-500 to-teal-600" },
  { icon: BarChart3, title: "Fleet Analytics", desc: "Revenue, expenses and performance — visualized in beautiful reports.", tone: "from-violet-500 to-purple-600" },
  { icon: UserCheck, title: "Driver Insights", desc: "Monitor ratings, trips and behavior to keep your team performing.", tone: "from-purple-500 to-fuchsia-600" },
  { icon: Route, title: "Trip Management", desc: "Schedule, track and complete journeys with cargo and revenue tracking.", tone: "from-orange-500 to-amber-600" },
  { icon: Wallet, title: "Expense Control", desc: "Log fuel, maintenance and tolls — always know where money goes.", tone: "from-teal-500 to-violet-600" },
  { icon: Bell, title: "Smart Alerts", desc: "Get notified about maintenance, low fuel and critical events instantly.", tone: "from-rose-500 to-red-600" },
];

const STATS = [
  { value: "12+", label: "Vehicles tracked" },
  { value: "98%", label: "On-time rate" },
  { value: "24/7", label: "Live monitoring" },
  { value: "€1.2M", label: "Revenue managed" },
];

export default function HomePage() {
  const tr = useT();
  return (
    <div className="text-slate-800">
      <Header />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-purple-950 text-white">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-violet-500/25 rounded-full blur-3xl animate-floaty" />
        <div className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] bg-purple-500/25 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "36px 36px" }} />

        <div className="relative z-10 container mx-auto px-6 sm:px-10 py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-amber-300" /> {tr("ui.the_modern_fleet_platform")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              {tr("ui.fleet_management")}<br /><span className="bg-gradient-to-r from-violet-300 to-teal-300 bg-clip-text text-transparent">{tr("ui.home_redefined")}</span>
            </h1>
            <p className="text-lg text-violet-100/90 max-w-xl mb-8">{tr("ui.home_hero_sub")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-4">
                {tr("ui.get_started")} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/about" className="btn text-lg px-8 py-4 bg-white/10 border border-white/20 text-white hover:bg-white/20">
                {tr("ui.learn_more")}
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-3">
                {["from-violet-400 to-violet-600", "from-emerald-400 to-teal-600", "from-purple-400 to-fuchsia-600", "from-orange-400 to-amber-600"].map((g, i) => (
                  <span key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2 border-violet-900`} />
                ))}
              </div>
              <div>
                <div className="flex text-amber-300">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-300" />)}</div>
                <div className="text-sm text-violet-100/80">{tr("ui.trusted_by_logistics_teams")}</div>
              </div>
            </div>
          </div>

          {/* Floating dashboard preview */}
          <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="card-glass p-5 text-slate-800 shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-sm font-semibold text-slate-500">Pathnio Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {([
                  { Icon: Truck, v: "12", l: "Vehicles", g: "from-orange-500 to-amber-600" },
                  { Icon: Route, v: "8", l: "Trips", g: "from-purple-500 to-fuchsia-600" },
                  { Icon: Gauge, v: "98%", l: "Uptime", g: "from-emerald-500 to-teal-600" },
                ] as const).map(({ Icon, v, l, g }, i) => (
                  <div key={i} className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${g} flex items-center justify-center mb-2`}><Icon className="w-4 h-4 text-white" /></div>
                    <div className="text-xl font-bold text-slate-900">{v}</div>
                    <div className="text-xs text-slate-400">{l}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
                <div className="text-sm font-semibold text-slate-600 mb-3">{tr("ui.weekly_revenue")}</div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-lg bg-gradient-to-t from-violet-600 to-purple-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-white py-14 border-b border-slate-100">
        <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-violet-700">{s.value}</div>
              <div className="text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[var(--background)]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{tr("ui.everything_you_need_to_run_a_fleet")}</h2>
            <p className="text-lg text-slate-500">{tr("ui.home_tools_sub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover p-7">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.tone} flex items-center justify-center shadow-md mb-5`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted brands */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-10">{tr("ui.trusted_by_leading_companies")}</h3>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {[
              { src: "/logos/DHL.png", alt: "DHL" },
              { src: "/logos/FEDEX.png", alt: "FedEx" },
              { src: "/logos/MAERSK.png", alt: "Maersk" },
              { src: "/logos/UPS.png", alt: "UPS" },
            ].map((logo, i) => (
              <div key={i} className="w-28 h-14 relative grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-violet-700 to-purple-800 text-white">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <ShieldCheck className="w-14 h-14 mx-auto mb-6 text-violet-200" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{tr("ui.ready_to_transform_your_fleet")}</h2>
          <p className="text-lg text-violet-100/90 mb-8">{tr("ui.home_join_sub")}</p>
          <Link href="/login" className="btn text-lg px-8 py-4 bg-white text-violet-800 hover:-translate-y-0.5 shadow-xl">
            {tr("ui.get_started_now")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
