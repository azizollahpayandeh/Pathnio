"use client";
import Link from 'next/link';

// تعریف type مناسب برای Trip
interface Trip {
  id: number;
  driver: string;
  vehicle: string;
  origin: string;
  destination: string;
  start: string;
  end: string;
  status: string;
}

export default function TripsThisWeekWidget({ trips }: { trips: Trip[] }) {
  return (
    <>
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
            {trips.slice(0,5).map((t, i) => (
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
        <Link href="/dashboard/trips" className="text-blue-700 font-bold hover:underline">View All Trips &rarr;</Link>
      </div>
    </>
  );
} 