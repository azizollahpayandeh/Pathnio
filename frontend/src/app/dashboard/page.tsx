"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LiveMap = dynamic(() => import("../../components/LiveMapWidget"), { ssr: false });
const Chart = dynamic(() => import("../../components/ChartWidget"), { ssr: false });
const TripsThisWeekWidget = dynamic(() => import("../../components/TripsThisWeekWidget"), { ssr: false });

const FAKE_TRIPS = [
  { id: 1, driver: "Amir", vehicle: "12A345-IR", origin: "Tehran", destination: "Isfahan", start: "2024-07-01 08:00", end: "2024-07-01 12:00", status: "Completed" },
  { id: 2, driver: "Sara", vehicle: "22B456-IR", origin: "Shiraz", destination: "Tabriz", start: "2024-07-02 09:00", end: "2024-07-02 15:00", status: "Completed" },
  { id: 3, driver: "Mohammad", vehicle: "33C567-IR", origin: "Mashhad", destination: "Tehran", start: "2024-07-03 07:30", end: "2024-07-03 13:00", status: "In Progress" },
  { id: 4, driver: "Reza", vehicle: "44D678-IR", origin: "Isfahan", destination: "Qom", start: "2024-07-04 10:00", end: "2024-07-04 14:00", status: "Completed" },
  { id: 5, driver: "Fatemeh", vehicle: "55E789-IR", origin: "Qom", destination: "Mashhad", start: "2024-07-05 11:00", end: "2024-07-05 18:00", status: "Cancelled" },
  { id: 6, driver: "Hossein", vehicle: "66F890-IR", origin: "Tabriz", destination: "Shiraz", start: "2024-07-06 06:00", end: "2024-07-06 13:00", status: "Completed" },
  { id: 7, driver: "Maryam", vehicle: "77G901-IR", origin: "Tehran", destination: "Isfahan", start: "2024-07-07 08:30", end: "2024-07-07 12:30", status: "Completed" },
  { id: 8, driver: "Ali", vehicle: "88H012-IR", origin: "Mashhad", destination: "Qom", start: "2024-07-08 09:00", end: "2024-07-08 15:00", status: "In Progress" },
  { id: 9, driver: "Zahra", vehicle: "99I123-IR", origin: "Isfahan", destination: "Tehran", start: "2024-07-09 10:00", end: "2024-07-09 14:00", status: "Completed" },
  { id: 10, driver: "Alireza", vehicle: "10J234-IR", origin: "Tehran", destination: "Shiraz", start: "2024-07-10 07:00", end: "2024-07-10 13:00", status: "Completed" },
];

export default function Dashboard() {
  const [fullscreen, setFullscreen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  
  useEffect(() => {
    setTrips(FAKE_TRIPS);
  }, []);

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
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
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="animate-fadein">
      {!fullscreen && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
            {/* Widgets */}
            <Widget title="Active Drivers" value="12" icon="🟢" color="from-green-400 to-blue-500" />
            <Widget title="Inactive Drivers" value="3" icon="🔴" color="from-red-400 to-pink-500" />
            <Widget title="Online Vehicles" value="8" icon="🚗" color="from-blue-400 to-purple-500" />
            <Widget title="Offline Vehicles" value="2" icon="🚙" color="from-gray-400 to-blue-200" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="relative col-span-2 bg-white/80 rounded-2xl shadow-2xl border border-blue-100 hover:shadow-blue-200 transition-shadow duration-300 p-0">
              <div className="flex items-center justify-between px-8 pt-8">
                <h2 className="font-extrabold mb-6 text-blue-700 text-xl flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Live Vehicle Map
                </h2>
                <button onClick={toggleFullscreen} className="ml-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition text-base">
                  Fullscreen
                </button>
              </div>
              <div className="w-full h-[520px] px-8 pb-8">
                <LiveMap fullscreen={false} />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <div className="bg-white/80 rounded-2xl shadow-2xl p-8 border border-blue-100 hover:shadow-blue-200 transition-shadow duration-300">
                <h2 className="font-extrabold mb-6 text-blue-700 text-xl flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Trips This Week
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl shadow text-base">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                        <th className="py-3 px-4 text-left">Trip ID</th>
                        <th className="py-3 px-4 text-left">Driver</th>
                        <th className="py-3 px-4 text-left">Vehicle</th>
                        <th className="py-3 px-4 text-left">Origin</th>
                        <th className="py-3 px-4 text-left">Destination</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.slice(0,1).map((t, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer">
                          <td className="py-3 px-4 font-bold text-blue-900">{t.id}</td>
                          <td className="py-3 px-4">{t.driver}</td>
                          <td className="py-3 px-4">{t.vehicle}</td>
                          <td className="py-3 px-4">{t.origin}</td>
                          <td className="py-3 px-4">{t.destination}</td>
                          <td className={`py-3 px-4 font-semibold ${t.status === 'Completed' ? 'text-green-600' : t.status === 'In Progress' ? 'text-yellow-500' : 'text-red-500'}`}>{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right mt-4">
                  <a href="/dashboard/trips" className="text-blue-700 font-bold hover:underline">View All Trips &rarr;</a>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 border border-blue-100 flex flex-col gap-4">
                <h2 className="font-bold mb-2 text-blue-700">Today's Expenses</h2>
                <div className="text-3xl font-extrabold text-green-600 drop-shadow-lg animate-fadein-slow">1,200,000 Toman</div>
                <h2 className="font-bold mb-2 mt-4 text-blue-700">This Month</h2>
                <div className="text-2xl font-bold text-blue-600 drop-shadow-lg animate-fadein-slow">8,500,000 Toman</div>
              </div>
            </div>
          </div>
        </>
      )}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <div className="absolute top-4 right-4 z-[10000]">
            <button onClick={toggleFullscreen} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition text-base">
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
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fadein-slow {
          animation: fadein 1.5s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
}

function Widget({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`relative bg-gradient-to-br ${color} rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 gap-2 border border-blue-100 hover:scale-105 hover:shadow-2xl transition-transform duration-300 animate-fadein`}>
      <span className="text-4xl drop-shadow-lg">{icon}</span>
      <span className="text-lg font-bold text-blue-900 drop-shadow">{title}</span>
      <span className="text-3xl font-extrabold text-white drop-shadow-lg">{value}</span>
      <div className="absolute -bottom-2 right-4 w-8 h-8 bg-white/30 rounded-full blur-2xl opacity-60"></div>
    </div>
  );
} 