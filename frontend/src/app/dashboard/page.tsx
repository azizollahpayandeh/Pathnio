'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '../loading';
import Link from 'next/link';

const LiveMap = dynamic(() => import('../../components/LiveMapWidget'), {
  ssr: false,
});

// Replace 'any' with a specific Trip type
interface Trip {
  id: number;
  driver: string;
  vehicle: string;
  origin: string;
  destination: string;
  start: string;
  end: string;
  status: string;
  date: string;
}

const FAKE_TRIPS = [
  {
    id: 1,
    driver: 'Amir',
    vehicle: '12A345-IR',
    origin: 'Tehran',
    destination: 'Isfahan',
    start: '2024-07-01 08:00',
    end: '2024-07-01 12:00',
    status: 'Completed',
  },
  {
    id: 2,
    driver: 'Sara',
    vehicle: '22B456-IR',
    origin: 'Shiraz',
    destination: 'Tabriz',
    start: '2024-07-02 09:00',
    end: '2024-07-02 15:00',
    status: 'Completed',
  },
  {
    id: 3,
    driver: 'Mohammad',
    vehicle: '33C567-IR',
    origin: 'Mashhad',
    destination: 'Tehran',
    start: '2024-07-03 07:30',
    end: '2024-07-03 13:00',
    status: 'In Progress',
  },
  {
    id: 4,
    driver: 'Reza',
    vehicle: '44D678-IR',
    origin: 'Isfahan',
    destination: 'Qom',
    start: '2024-07-04 10:00',
    end: '2024-07-04 14:00',
    status: 'Completed',
  },
  {
    id: 5,
    driver: 'Fatemeh',
    vehicle: '55E789-IR',
    origin: 'Qom',
    destination: 'Mashhad',
    start: '2024-07-05 11:00',
    end: '2024-07-05 18:00',
    status: 'Cancelled',
  },
  {
    id: 6,
    driver: 'Hossein',
    vehicle: '66F890-IR',
    origin: 'Tabriz',
    destination: 'Shiraz',
    start: '2024-07-06 06:00',
    end: '2024-07-06 13:00',
    status: 'Completed',
  },
  {
    id: 7,
    driver: 'Maryam',
    vehicle: '77G901-IR',
    origin: 'Tehran',
    destination: 'Isfahan',
    start: '2024-07-07 08:30',
    end: '2024-07-07 12:30',
    status: 'Completed',
  },
  {
    id: 8,
    driver: 'Ali',
    vehicle: '88H012-IR',
    origin: 'Mashhad',
    destination: 'Qom',
    start: '2024-07-08 09:00',
    end: '2024-07-08 15:00',
    status: 'In Progress',
  },
  {
    id: 9,
    driver: 'Zahra',
    vehicle: '99I123-IR',
    origin: 'Isfahan',
    destination: 'Tehran',
    start: '2024-07-09 10:00',
    end: '2024-07-09 14:00',
    status: 'Completed',
  },
  {
    id: 10,
    driver: 'Alireza',
    vehicle: '10J234-IR',
    origin: 'Tehran',
    destination: 'Shiraz',
    start: '2024-07-10 07:00',
    end: '2024-07-10 13:00',
    status: 'Completed',
  },
];

// تعریف type مناسب برای Fullscreen API
interface DocumentWithFullscreen extends Document {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export default function Dashboard() {
  const [fullscreen, setFullscreen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const access = localStorage.getItem('access');
    const userData = localStorage.getItem('user');

    if (!access || !userData) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    setIsLoading(false);
    setTrips(FAKE_TRIPS.map((t) => ({ ...t, date: t.start })));
  }, [router]);

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (
        (document.documentElement as unknown as DocumentWithFullscreen)
          .webkitRequestFullscreen
      ) {
        (document.documentElement as unknown as DocumentWithFullscreen)
          .webkitRequestFullscreen!();
      } else if (
        (document.documentElement as unknown as DocumentWithFullscreen)
          .msRequestFullscreen
      ) {
        (document.documentElement as unknown as DocumentWithFullscreen)
          .msRequestFullscreen!();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as DocumentWithFullscreen).webkitExitFullscreen) {
        (document as DocumentWithFullscreen).webkitExitFullscreen!();
      } else if ((document as DocumentWithFullscreen).msExitFullscreen) {
        (document as DocumentWithFullscreen).msExitFullscreen!();
      }
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'msfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="animate-fadein">
      {!fullscreen && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">
            {/* Professional Fleet Management Stats Cards */}
            <StatsCard
              title="Active Drivers"
              value="12"
              change="+2"
              changeType="positive"
              icon={
                <svg
                  className="w-6 h-6 lg:w-8 lg:h-8"
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
              bgGradient="from-emerald-500 to-teal-600"
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <StatsCard
              title="Inactive Drivers"
              value="3"
              change="-1"
              changeType="negative"
              icon={
                <svg
                  className="w-6 h-6 lg:w-8 lg:h-8"
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
              bgGradient="from-red-500 to-pink-600"
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />
            <StatsCard
              title="Online Vehicles"
              value="8"
              change="+3"
              changeType="positive"
              icon={
                <svg
                  className="w-6 h-6 lg:w-8 lg:h-8"
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
              bgGradient="from-blue-500 to-indigo-600"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Offline Vehicles"
              value="2"
              change="-2"
              changeType="positive"
              icon={
                <svg
                  className="w-6 h-6 lg:w-8 lg:h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              bgGradient="from-gray-500 to-slate-600"
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="relative lg:col-span-2 bg-white/80 rounded-2xl shadow-2xl border border-blue-100 hover:shadow-blue-200 transition-shadow duration-300 p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 lg:pb-6 gap-4">
                <h2 className="font-extrabold text-blue-700 text-lg lg:text-xl flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Live Vehicle Map
                </h2>
                <button
                  onClick={toggleFullscreen}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition text-sm lg:text-base"
                >
                  Fullscreen
                </button>
              </div>
              <div className="w-full h-[300px] sm:h-[400px] lg:h-[520px] px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
                <LiveMap fullscreen={false} />
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="bg-white/80 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-blue-100 hover:shadow-blue-200 transition-shadow duration-300">
                <h2 className="font-extrabold mb-4 lg:mb-6 text-blue-700 text-lg lg:text-xl flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Trips This Week
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl shadow text-sm lg:text-base">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left text-xs lg:text-sm">
                          Trip ID
                        </th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left text-xs lg:text-sm">
                          Driver
                        </th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left text-xs lg:text-sm">
                          Vehicle
                        </th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left text-xs lg:text-sm hidden sm:table-cell">
                          Origin
                        </th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left text-xs lg:text-sm hidden lg:table-cell">
                          Destination
                        </th>
                        <th className="py-2 lg:py-3 px-2 lg:px-4 text-left text-xs lg:text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.slice(0, 1).map((t, i) => (
                        <tr
                          key={i}
                          className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer"
                        >
                          <td className="py-2 lg:py-3 px-2 lg:px-4 font-bold text-blue-900 text-xs lg:text-sm">
                            {t.id}
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm">
                            {t.driver}
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm">
                            {t.vehicle}
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm hidden sm:table-cell">
                            {t.origin}
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm hidden lg:table-cell">
                            {t.destination}
                          </td>
                          <td
                            className={`py-2 lg:py-3 px-2 lg:px-4 font-semibold text-xs lg:text-sm ${
                              t.status === 'Completed'
                                ? 'text-green-600'
                                : t.status === 'In Progress'
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                          >
                            {t.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right mt-4">
                  <Link
                    href="/dashboard/trips"
                    className="text-blue-700 font-bold hover:underline text-sm lg:text-base"
                  >
                    View All Trips &rarr;
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-blue-100 flex flex-col gap-4">
                <h2 className="font-bold mb-2 text-blue-700 text-sm lg:text-base">
                  Today's Expenses
                </h2>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-green-600 drop-shadow-lg animate-fadein-slow">
                  1,200,000 Toman
                </div>
                <h2 className="font-bold mb-2 mt-4 text-blue-700 text-sm lg:text-base">
                  This Month
                </h2>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 drop-shadow-lg animate-fadein-slow">
                  8,500,000 Toman
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <div className="absolute top-4 right-4 z-[10000]">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition text-base"
            >
              Exit Fullscreen
            </button>
          </div>
          <div className="w-full h-full">
            <LiveMap fullscreen={true} />
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadein {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .animate-fadein-slow {
          animation: fadein 1.5s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}

function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  bgGradient,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-100/50 hover:shadow-blue-200/50 hover:shadow-2xl transition-all duration-300 animate-fadein group overflow-hidden">
      {/* Sophisticated gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      {/* Rainbow-like border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-8 lg:-translate-y-16 translate-x-8 lg:translate-x-16 blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-100/30 to-blue-100/30 rounded-full translate-y-6 lg:translate-y-12 -translate-x-6 lg:-translate-x-12 blur-xl"></div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div
            className={`p-2 lg:p-3 rounded-xl ${iconBg} ${iconColor} shadow-lg backdrop-blur-sm border border-white/50`}
          >
            {icon}
          </div>
          <div
            className={`flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
              changeType === 'positive'
                ? 'bg-green-50/80 text-green-700 border-green-200/50'
                : 'bg-red-50/80 text-red-700 border-red-200/50'
            }`}
          >
            <span
              className={
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }
            >
              {changeType === 'positive' ? '↗' : '↘'}
            </span>
            {change}
          </div>
        </div>

        <div className="text-gray-800">
          <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">{title}</h3>
          <div className="text-xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {value}
          </div>
        </div>

        {/* Subtle hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      </div>
    </div>
  );
}
