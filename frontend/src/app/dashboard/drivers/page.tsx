"use client";
import { useEffect, useState } from "react";
import api from "../../api";
import { useRouter } from "next/navigation";

// تعریف type مناسب برای Driver
interface Driver {
  id: number;
  name: string;
  company: { company_name: string };
  // سایر فیلدها در صورت نیاز
}

const FAKE_DRIVERS = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1, // اضافه کردن id فیک
  full_name: `Driver ${i + 1}`,
  mobile: `0912${100000 + i}`,
  plate_number: `12A${i}34-IR`,
  vehicle_type: i % 2 === 0 ? "Sedan" : "Truck",
  company: { company_name: "Demo Co." },
  origin: "Tehran",
  destination: i % 2 === 0 ? "Isfahan" : "Shiraz",
}));

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get("accounts/drivers/")
      .then(res => {
        console.log("Drivers API response:", res.data);
        // Check if res.data is an array, if not, try to find the results
        const driversData = Array.isArray(res.data) ? res.data : (res.data.results || res.data.drivers || []);
        setDrivers(driversData.map((d: any) => ({ ...d, origin: d.origin || "Tehran", destination: d.destination || "Isfahan" })));
        setError(null);
      })
      .catch((err) => {
        console.error("Drivers API error:", err);
        setError("Failed to load drivers.");
        setDrivers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-[1100px] 2xl:max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <h1 className="font-extrabold text-2xl md:text-3xl mb-4 md:mb-6 lg:mb-8 text-blue-700 flex-shrink-0">Drivers Management</h1>
        {loading ? (
          <div className="text-blue-400 animate-pulse text-lg">Loading drivers...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto lg:overflow-visible">
              <div className="min-w-full lg:w-full">
                <table className="w-full bg-white rounded-xl shadow-md text-xs sm:text-sm md:text-base lg:text-[18px] 2xl:text-[19px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left rounded-tl-xl whitespace-nowrap">Full Name</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left whitespace-nowrap">Mobile</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left whitespace-nowrap">Plate Number</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left whitespace-nowrap">Vehicle Type</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left whitespace-nowrap">Company</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left whitespace-nowrap">Origin</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left whitespace-nowrap">Destination</th>
                      <th className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 lg:py-[16px] text-left rounded-tr-xl whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(error || drivers.length === 0 ? FAKE_DRIVERS : drivers.slice(0, 10)).map((d, i) => (
                      <tr key={d.id || i} className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer">
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 font-bold text-blue-900 whitespace-nowrap">{d.full_name}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">{d.mobile}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">{d.plate_number}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">{d.vehicle_type || '-'}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">{d.company ? d.company.company_name || '-' : '-'}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">{d.origin || '-'}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">{d.destination || '-'}</td>
                        <td className="py-2 md:py-3 lg:py-3 px-2 md:px-3 lg:px-4 whitespace-nowrap">
                          <button
                            className="bg-blue-100 text-blue-700 px-1 md:px-2 lg:px-3 py-1 md:py-1.5 rounded-lg shadow hover:bg-blue-200 transition text-xs lg:text-[17px] font-semibold cursor-pointer"
                            onClick={() => router.push(`/dashboard/drivers/${d.id}`)}
                          >
                            View
                          </button>
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