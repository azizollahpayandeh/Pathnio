"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Map, Users, Truck, Route, Wallet, BarChart3,
  Bell, CreditCard, LifeBuoy, Settings, ShieldCheck, Menu, LogOut, X,
} from "lucide-react";
import { useAuth, logout } from "@/lib/auth";
import { useT } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useFleetAlerts } from "@/lib/api-data";
import { ToastHost } from "@/components/Toast";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  color: string;
  admin?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, color: "text-violet-500" },
  { href: "/dashboard/live-map", labelKey: "nav.liveMap", icon: Map, color: "text-emerald-500" },
  { href: "/dashboard/drivers", labelKey: "nav.drivers", icon: Users, color: "text-purple-500" },
  { href: "/dashboard/vehicles", labelKey: "nav.vehicles", icon: Truck, color: "text-orange-500" },
  { href: "/dashboard/trips", labelKey: "nav.trips", icon: Route, color: "text-purple-500" },
  { href: "/dashboard/expenses", labelKey: "nav.expenses", icon: Wallet, color: "text-emerald-600" },
  { href: "/dashboard/reports", labelKey: "nav.reports", icon: BarChart3, color: "text-violet-600" },
  { href: "/dashboard/alerts", labelKey: "nav.alerts", icon: Bell, color: "text-amber-500" },
  { href: "/dashboard/subscription", labelKey: "nav.subscription", icon: CreditCard, color: "text-teal-500" },
  { href: "/dashboard/support", labelKey: "nav.support", icon: LifeBuoy, color: "text-teal-500" },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, color: "text-slate-500" },
  { href: "/dashboard/admin", labelKey: "nav.admin", icon: ShieldCheck, color: "text-rose-500", admin: true },
];

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const tr = useT();
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 select-none ${
        isActive
          ? "bg-white text-violet-700 shadow-soft border border-violet-100"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
          isActive ? "text-violet-600" : item.color
        }`}
      />
      <span>{tr(item.labelKey)}</span>
    </Link>
  );
}

function SidebarContent({ isPlatformAdmin, onNavigate }: { isPlatformAdmin: boolean; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center h-20 px-6 border-b border-slate-200/70">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold text-2xl text-violet-800 tracking-wide"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-brand">
            <Truck className="w-5 h-5 text-white" />
          </span>
          Pathnio
        </Link>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scroll-slim">
        {NAV.filter((i) => !i.admin || isPlatformAdmin).map((item) => (
          <SidebarLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tr = useT();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Real open (unacknowledged) fleet-alert count.
  const { data: alerts } = useFleetAlerts();
  const unread = alerts.filter((a) => !a.read).length;

  useEffect(() => {
    if (ready && !user) router.push("/login");
  }, [ready, user, router]);

  // One-time purge of any legacy localStorage demo data (older builds seeded
  // demo drivers/vehicles into localStorage). No page reads it anymore, but we
  // actively remove it so nothing stale can ever surface.
  useEffect(() => {
    try {
      ["pathnio_db_v4", "pathnio_db_v3", "pathnio_db_v2", "pathnio_db_v1", "pathnio_db"].forEach(
        (k) => localStorage.removeItem(k)
      );
    } catch {
      /* ignore storage errors */
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const isPlatformAdmin = !!user?.is_staff;  // platform admin only
  const displayName = user?.company_name || user?.manager_full_name || "Pathnio";
  const avatar = user?.profile_photo;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] text-slate-800">
      <ToastHost />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-gradient-to-b from-slate-50 to-violet-50/70 border-r border-slate-200 shadow-sm">
        <SidebarContent isPlatformAdmin={isPlatformAdmin} />
      </aside>

      {/* Mobile overlay + drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gradient-to-b from-slate-50 to-violet-50 border-r border-slate-200 shadow-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent isPlatformAdmin={isPlatformAdmin} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label={tr("ui.open_menu")}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">{tr("nav.fleetManagement")}</span>
              <span className="sm:hidden">{tr("nav.dashboard")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <LanguageSwitcher compact />
            <button
              onClick={() => router.push("/dashboard/alerts")}
              className="relative w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              aria-label={tr("ui.alerts")}
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow">
                  {unread}
                </span>
              )}
            </button>

            <div
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 pl-1.5 pr-3 py-1.5 rounded-xl transition"
            >
              {avatar ? (
                <Image src={avatar} alt="User" width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="font-semibold text-slate-800 text-sm hidden sm:block max-w-[140px] truncate">{displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
              aria-label={tr("ui.log_out")}
              title={tr("ui.log_out")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-slim p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
