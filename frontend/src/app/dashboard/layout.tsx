"use client";

import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          if (!parsedUser.company_name) {
            // لاگ برای دیباگ
            console.log("[DEBUG] user object:", parsedUser);
          }
        } catch (e) {
          console.log("[DEBUG] user parse error", e, userStr);
        }
      } else {
        console.log("[DEBUG] user not found in localStorage");
      }
    }
  }, []);
  // نمایش نام شرکت اگر وجود داشت، وگرنه نام کامل کاربر
  const displayName =
    user?.company_name ||
    user?.company?.company_name ||
    user?.companyName ||
    user?.company?.name ||
    "No Name";
  // آواتار پیش‌فرض غیرانسانی (مثلاً animal)
  const avatar = user?.avatar || "/assets/images.png";
  const handleProfileClick = () => {
    router.push("/profile");
  };
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f4f8fb] text-[#171717] flex min-h-screen`}>
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-white via-blue-50 to-blue-100 border-l border-gray-200 flex flex-col transition-all duration-200 shadow-xl z-20">
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <span className="font-extrabold text-2xl text-blue-800 tracking-widest select-none">Pathnio</span>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-2">
          <SidebarLink href="/dashboard" label="Dashboard" icon="🏠" />
          <SidebarLink href="/dashboard/live-map" label="Live Map" icon="🗺️" />
          <SidebarLink href="/dashboard/drivers" label="Drivers" icon="🚗" />
          <SidebarLink href="/dashboard/vehicles" label="Vehicles" icon="🚙" />
          <SidebarLink href="/dashboard/trips" label="Trips" icon="🛣️" />
          <SidebarLink href="/dashboard/expenses" label="Expenses" icon="💳" />
          <SidebarLink href="/dashboard/reports" label="Reports" icon="📊" />
          <SidebarLink href="/dashboard/alerts" label="Alerts" icon="🔔" />
          <SidebarLink href="/dashboard/subscription" label="Subscription" icon="💼" />
          <SidebarLink href="/dashboard/support" label="Support" icon="🆘" />
          <SidebarLink href="/dashboard/settings" label="Settings" icon="⚙️" />
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-xl border-b flex items-center justify-between px-6 z-30 sticky top-0 left-0 right-0 transition-all duration-200">
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold text-blue-800 tracking-wide flex items-center gap-3 drop-shadow-lg select-none">
              <span className="inline-block w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full animate-pulse shadow-lg"></span>
              Fleet Management
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Button */}
            <button
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-md border border-blue-200 hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer group"
              onClick={() => router.push('/dashboard/alerts')}
              aria-label="Notifications"
            >
              <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-800 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 font-bold shadow animate-bounce">3</span>
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 px-3 py-1.5 rounded-xl shadow-md border border-blue-200 hover:scale-105 hover:shadow-xl transition-all duration-200 group"
              onClick={handleProfileClick}
            >
              <img src={avatar} alt="User" className="w-8 h-8 rounded-full border-2 border-blue-300 object-cover shadow-lg group-hover:ring-2 group-hover:ring-blue-400 transition" />
              <span className="font-bold text-blue-800 text-base group-hover:text-blue-900 transition drop-shadow">{displayName}</span>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-6 bg-[#f4f8fb]">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-lg transition-all duration-200 select-none
        ${isActive ? 'bg-gradient-to-r from-blue-100 via-blue-50 to-white text-blue-800 shadow-lg border border-blue-200' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'}
        group mb-2 cursor-pointer`}
      style={{ fontFamily: 'inherit', letterSpacing: '0.01em' }}
    >
      <span className="text-2xl transition-transform duration-200 group-hover:scale-110 drop-shadow-sm">
        {icon}
      </span>
      <span className="transition-colors duration-200 group-hover:text-blue-700">
        {label}
      </span>
    </Link>
  );
} 