'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import api, { API_BASE_URL } from '../api';

interface User {
  id: string;
  username?: string;
  email?: string;
  company_name?: string;
  company?: { company_name?: string; name?: string };
  companyName?: string;
  profile_photo?: string;
  full_name?: string;
  is_staff?: boolean;
  is_manager?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        sidebarOpen &&
        !target.closest('.sidebar') &&
        !target.closest('.hamburger')
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Close sidebar on route change (only on mobile)
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [usePathname()]);

  useEffect(() => {
    async function fetchAndSyncProfile() {
      // Check if user is authenticated
      if (typeof window !== 'undefined') {
        const access = localStorage.getItem('access');
        if (!access) {
          console.log('No access token found, redirecting to login');
          router.push('/login');
          return;
        }
      }

      try {
        const res = await api.get('/accounts/profile/');
        console.log('Dashboard - Fetched profile data:', res.data);
        setUser((prev) => {
          const updated = {
            ...prev,
            full_name: res.data.full_name,
            company_name: res.data.company_name,
            profile_photo: res.data.profile_photo || '/assets/images.png',
            phone: res.data.phone,
          } as User;
          console.log('Dashboard - Updated user object:', updated);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updated));
          }
          return updated;
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // If there's an authentication error, redirect to login
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          (error as any).response?.status === 401
        ) {
          router.push('/login');
        }
      }
    }

    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          if (!parsedUser.company_name) {
            console.log('[DEBUG] user object:', parsedUser);
          }
        } catch (e) {
          console.log('[DEBUG] user parse error', e, userStr);
        }
      } else {
        console.log('[DEBUG] user not found in localStorage');
      }
      // Always fetch fresh profile from backend
      fetchAndSyncProfile();
    }
  }, []);

  const displayName =
    user?.company_name ||
    user?.company?.company_name ||
    user?.full_name ||
    user?.username ||
    'No Name';

  const getProfilePhotoUrl = (photo: string | undefined) => {
    console.log('Dashboard - Getting photo URL for:', photo);
    if (!photo) {
      console.log('Dashboard - No photo, using default');
      return '/assets/images.png';
    }
    if (photo.startsWith('http')) {
      console.log('Dashboard - Photo is already full URL:', photo);
      return photo;
    }
    if (photo.startsWith('/media/')) {
      const fullUrl = API_BASE_URL + photo;
      console.log('Dashboard - Built full URL:', fullUrl);
      return fullUrl;
    }
    console.log('Dashboard - Photo is relative path:', photo);
    return photo;
  };

  const avatar = getProfilePhotoUrl(user?.profile_photo);
  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className="antialiased bg-[#f4f8fb] text-[#171717] flex h-screen">
      {/* Sidebar for Desktop - Always Visible */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-blue-50 to-blue-100 border-l border-gray-200 flex-col shadow-xl">
        <div className="flex items-center justify-center h-20 px-4 border-b">
          <Link
            href="/"
            className="font-extrabold text-2xl text-blue-800 tracking-widest select-none hover:text-blue-600 transition-colors cursor-pointer"
          >
            Pathnio
          </Link>
        </div>

        <nav className="flex-1 py-8 px-3 space-y-3 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/live-map"
            label="Live Map"
            icon={
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/drivers"
            label="Drivers"
            icon={
              <svg
                className="w-6 h-6 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/vehicles"
            label="Vehicles"
            icon={
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/trips"
            label="Trips"
            icon={
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/expenses"
            label="Expenses"
            icon={
              <svg
                className="w-[25px] h-7 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/reports"
            label="Reports"
            icon={
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/alerts"
            label="Alerts"
            icon={
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/subscription"
            label="Subscription"
            icon={
              <svg
                className="w-6 h-6 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/support"
            label="Support"
            icon={
              <svg
                className="w-6 h-6 text-cyan-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/settings"
            label="Settings"
            icon={
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
          {user && (user.is_manager || user.is_staff) && (
            <SidebarLink
              href="/dashboard/admin"
              label="Admin Dashboard"
              icon={
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z"
                  />
                </svg>
              }
            />
          )}
        </nav>
      </aside>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Mobile - Toggleable */}
      <aside
        className={`sidebar lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-blue-50 to-blue-100 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-20 px-4 border-b">
          <Link
            href="/"
            className="font-extrabold text-2xl text-blue-800 tracking-widest select-none hover:text-blue-600 transition-colors cursor-pointer"
          >
            Pathnio
          </Link>
        </div>

        <nav className="flex-1 py-8 px-3 space-y-3 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/live-map"
            label="Live Map"
            icon={
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/drivers"
            label="Drivers"
            icon={
              <svg
                className="w-6 h-6 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/vehicles"
            label="Vehicles"
            icon={
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/trips"
            label="Trips"
            icon={
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/expenses"
            label="Expenses"
            icon={
              <svg
                className="w-[25px] h-7 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/reports"
            label="Reports"
            icon={
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/alerts"
            label="Alerts"
            icon={
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/subscription"
            label="Subscription"
            icon={
              <svg
                className="w-6 h-6 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/support"
            label="Support"
            icon={
              <svg
                className="w-6 h-6 text-cyan-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <SidebarLink
            href="/dashboard/settings"
            label="Settings"
            icon={
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
          {user && (user.is_manager || user.is_staff) && (
            <SidebarLink
              href="/dashboard/admin"
              label="Admin Dashboard"
              icon={
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z"
                  />
                </svg>
              }
            />
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="h-16 bg-white shadow-xl border-b flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0 left-0 right-0 transition-all duration-200">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button
              className="hamburger lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 shadow-md border border-blue-200 hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer group"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-blue-800 transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <span className="text-lg lg:text-xl font-extrabold text-blue-800 tracking-wide flex items-center gap-3 drop-shadow-lg select-none">
              <span className="inline-block w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full animate-pulse shadow-lg"></span>
              <span className="hidden sm:inline">Fleet Management</span>
              <span className="sm:hidden">Fleet</span>
            </span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Notification Button */}
            <button
              className="relative flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-md border border-blue-200 hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer group"
              onClick={() => router.push('/dashboard/alerts')}
              aria-label="Notifications"
            >
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 group-hover:text-blue-800 transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 font-bold shadow animate-bounce">
                3
              </span>
            </button>

            {/* Profile Section */}
            <div
              className="flex items-center gap-2 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 px-2 lg:px-3 py-1.5 rounded-xl shadow-md border border-blue-200 hover:scale-105 hover:shadow-xl transition-all duration-200 group"
              onClick={handleProfileClick}
            >
              <Image
                src={avatar}
                alt="User"
                width={32}
                height={32}
                className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-blue-300 object-cover shadow-lg group-hover:ring-2 group-hover:ring-blue-400 transition"
              />
              <span className="font-bold text-blue-800 text-sm lg:text-base group-hover:text-blue-900 transition drop-shadow hidden sm:block">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 bg-[#f4f8fb] overflow-x-hidden">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-5 py-3 rounded-2xl font-semibold text-lg transition-all duration-200 select-none
        ${
          isActive
            ? 'bg-gradient-to-r from-blue-100 via-blue-50 to-white text-blue-800 shadow-lg border border-blue-200'
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
        }
        group mb-2 cursor-pointer`}
      style={{ fontFamily: 'inherit', letterSpacing: '0.01em' }}
    >
      <span className="transition-transform duration-200 group-hover:scale-110 drop-shadow-sm text-gray-600 group-hover:text-gray-800">
        {icon}
      </span>
      <span className="transition-colors duration-200 group-hover:text-blue-700">
        {label}
      </span>
    </Link>
  );
}
