"use client";
import { useEffect, useState } from "react";

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

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setTrips([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showTrips = trips.length >= 10 ? trips.slice(0, 10) : [...trips, ...FAKE_TRIPS.slice(0, 10 - trips.length)];

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-[1100px] 2xl:max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <h1 className="font-extrabold text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 lg:mb-6 text-blue-700 flex-shrink-0">Trips History</h1>
        {loading ? (
          <div className="text-blue-400 animate-pulse text-lg">Loading trips...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto lg:overflow-visible">
              <div className="min-w-full lg:w-full">
                <table className="w-full bg-white rounded-xl shadow-md text-xs sm:text-sm md:text-base lg:text-base 2xl:text-[20px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left rounded-tl-xl whitespace-nowrap">Trip ID</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Driver</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Vehicle</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Origin</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Destination</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Start Time</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">End Time</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Status</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left rounded-tr-xl whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showTrips.map((t, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer">
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] font-bold text-blue-900 whitespace-nowrap">{t.id}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] whitespace-nowrap">{t.driver}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] whitespace-nowrap">{t.vehicle}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] whitespace-nowrap">{t.origin}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] whitespace-nowrap">{t.destination}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] whitespace-nowrap">{t.start}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 lg:py-[16px] whitespace-nowrap">{t.end}</td>
                        <td className={`py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 font-semibold whitespace-nowrap ${t.status === 'Completed' ? 'text-green-600' : t.status === 'In Progress' ? 'text-yellow-500' : 'text-red-500'}`}>{t.status}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 whitespace-nowrap">
                          <button className="bg-blue-100 text-blue-700 px-1 md:px-1.5 lg:px-2 py-0.5 md:py-1 rounded-lg shadow hover:bg-blue-200 transition 2xl:text-[17px] font-semibold cursor-pointer">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 