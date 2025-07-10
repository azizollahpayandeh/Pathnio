"use client";
import { useEffect, useState } from "react";

const FAKE_VEHICLES = [
  { plate_number: "12A345-IR", vehicle_type: "Truck", driver: "Amir", company: "Demo Co.", status: "Active", capacity: "10t", color: "White" },
  { plate_number: "22B456-IR", vehicle_type: "Van", driver: "Sara", company: "Demo Co.", status: "Inactive", capacity: "2t", color: "Blue" },
  { plate_number: "33C567-IR", vehicle_type: "Sedan", driver: "Mohammad", company: "Demo Co.", status: "Active", capacity: "5t", color: "Black" },
  { plate_number: "44D678-IR", vehicle_type: "Truck", driver: "Reza", company: "Demo Co.", status: "Maintenance", capacity: "12t", color: "Red" },
  { plate_number: "55E789-IR", vehicle_type: "Van", driver: "Fatemeh", company: "Demo Co.", status: "Active", capacity: "3t", color: "Green" },
  { plate_number: "66F890-IR", vehicle_type: "Sedan", driver: "Hossein", company: "Demo Co.", status: "Inactive", capacity: "4t", color: "Gray" },
  { plate_number: "77G901-IR", vehicle_type: "Truck", driver: "Maryam", company: "Demo Co.", status: "Active", capacity: "15t", color: "Yellow" },
  { plate_number: "88H012-IR", vehicle_type: "Van", driver: "Ali", company: "Demo Co.", status: "Active", capacity: "2.5t", color: "White" },
  { plate_number: "99I123-IR", vehicle_type: "Sedan", driver: "Zahra", company: "Demo Co.", status: "Maintenance", capacity: "5t", color: "Blue" },
  { plate_number: "10J234-IR", vehicle_type: "Truck", driver: "Alireza", company: "Demo Co.", status: "Active", capacity: "20t", color: "Black" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setVehicles([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showVehicles = vehicles.length >= 10 ? vehicles.slice(0, 10) : [...vehicles, ...FAKE_VEHICLES.slice(0, 10 - vehicles.length)];

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-[1100px] 2xl:max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <h1 className="font-extrabold text-2xl md:text-3xl mb-4 md:mb-6 lg:mb-8 text-blue-700 flex-shrink-0">Vehicles Management</h1>
        {loading ? (
          <div className="text-blue-400 animate-pulse text-lg">Loading vehicles...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto lg:overflow-visible">
              <div className="min-w-full lg:w-full">
                <table className="w-full bg-white rounded-xl shadow-md text-xs sm:text-sm md:text-base lg:text-[16px] 2xl:text-[19px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  rounded-tl-xl whitespace-nowrap">Plate Number</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  whitespace-nowrap">Vehicle Type</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  whitespace-nowrap">Driver</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  whitespace-nowrap">Company</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  whitespace-nowrap">Status</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  whitespace-nowrap">Capacity</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  whitespace-nowrap">Color</th>
                      <th className="py-3 md:py-4 px-3 md:px-6 text-left  rounded-tr-xl whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showVehicles.map((v, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer">
                        <td className="py-3 md:py-4 px-3 md:px-6 font-bold text-blue-900 whitespace-nowrap">{v.plate_number}</td>
                        <td className="py-3 md:py-4 px-3 md:px-6 whitespace-nowrap">{v.vehicle_type}</td>
                        <td className="py-3 md:py-4 px-3 md:px-6 whitespace-nowrap">{v.driver}</td>
                        <td className="py-3 md:py-4 px-3 md:px-6 whitespace-nowrap">{v.company}</td>
                        <td className={`py-3 md:py-4 px-3 md:px-6 font-semibold whitespace-nowrap ${v.status === 'Active' ? 'text-green-600' : v.status === 'Inactive' ? 'text-gray-400' : 'text-yellow-500'}`}>{v.status}</td>
                        <td className="py-3 md:py-4 px-3 md:px-6 whitespace-nowrap">{v.capacity}</td>
                        <td className="py-3 md:py-4 px-3 md:px-6 whitespace-nowrap">{v.color}</td>
                        <td className="py-3 md:py-4 px-3 md:px-6 whitespace-nowrap">
                          <button className="bg-blue-100 text-blue-700 px-2 md:px-4 py-1 md:py-2 rounded-lg shadow hover:bg-blue-200 transition text-xs md:text-sm lg:text-base font-semibold cursor-pointer">View</button>
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
