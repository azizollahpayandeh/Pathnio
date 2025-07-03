"use client";

import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col transition-all duration-200 shadow-lg z-20">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="font-bold text-xl text-blue-700">Pathnio</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-2">
          <SidebarLink href="/dashboard" label="Dashboard" icon="🏠" />
          <SidebarLink href="/dashboard/live-map" label="Live Map" icon="🗺️" />
          <SidebarLink href="/dashboard/drivers" label="Drivers" icon="🚗" />
          <SidebarLink href="/dashboard/vehicles" label="Vehicles" icon="🚙" />
          <SidebarLink href="/dashboard/trips" label="Trips" icon="🛣️" />
          <SidebarLink href="/dashboard/expenses" label="Expenses" icon="💳" />
          <SidebarLink href="/dashboard/reports" label="Reports" icon="📊" />
          <SidebarLink href="/dashboard/alerts" label="Alerts" icon="🔔" />
          <SidebarLink href="/dashboard/settings" label="Settings" icon="⚙️" />
          <SidebarLink href="/dashboard/subscription" label="Subscription" icon="💼" />
          <SidebarLink href="/dashboard/users" label="Users" icon="👤" />
          <SidebarLink href="/dashboard/support" label="Support" icon="🆘" />
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-blue-700">Fleet Management Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <span className="material-icons text-blue-600">notifications</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">3</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleProfileClick}>
              <img src={avatar} alt="User" className="w-8 h-8 rounded-full border" />
              <span className="font-medium">{displayName}</span>
            </div>
            <button className="text-gray-500 hover:text-red-600 font-bold">Logout</button>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-6 bg-[#f4f8fb]">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors">
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
} 