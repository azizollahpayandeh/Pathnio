'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Add FAKE_VEHICLES array for demo (should be replaced with API call in real app)
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

const VehiclePerformanceChart = dynamic(() => import('../../../../components/VehiclePerformanceChart'), { ssr: false });

export default function VehicleDetails() {
  const params = useParams();
  const plate_number = decodeURIComponent(params.id as string);
  const vehicle = useMemo(() => FAKE_VEHICLES.find(v => v.plate_number === plate_number), [plate_number]);
  if (!vehicle) {
    return <div className="text-center text-red-500 font-bold text-2xl mt-20">Vehicle not found</div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen px-4 py-8 sm:px-6 lg:px-8 font-[Inter,sans-serif] text-gray-800 flex justify-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        {/* Vehicle Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row gap-8 border border-blue-100">
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 shadow-lg">{vehicle.plate_number.slice(0,2)}</div>
              <div>
                <div className="text-2xl font-extrabold text-blue-700">{vehicle.plate_number}</div>
                <div className="text-base text-gray-500">{vehicle.vehicle_type}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="text-xs text-gray-400">Driver</div>
                <div className="font-bold text-lg text-blue-900">{vehicle.driver}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Company</div>
                <div className="font-bold text-lg text-blue-900">{vehicle.company}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className={`font-bold text-lg ${vehicle.status === 'Active' ? 'text-green-600' : vehicle.status === 'Inactive' ? 'text-gray-400' : 'text-yellow-500'}`}>{vehicle.status}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Capacity</div>
                <div className="font-bold text-lg text-blue-900">{vehicle.capacity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Color</div>
                <div className="font-bold text-lg text-blue-900">{vehicle.color}</div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <VehiclePerformanceChart />
          </div>
        </div>

      </div>
    </div>
  );
}
