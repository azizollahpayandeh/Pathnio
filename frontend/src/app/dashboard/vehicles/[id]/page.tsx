'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Custom SVG Icons for a more unique look, adapted for light mode
const GaugeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
      fill="currentColor"
      opacity="0.1"
    />
    <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
    <path
      d="M16.236 7.764a6 6 0 00-8.472 8.472"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const FuelIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M8 6C8 5.44772 8.44772 5 9 5H15C15.5523 5 16 5.44772 16 6V9H8V6Z"
      fill="currentColor"
      opacity="0.5"
    />
    <path
      d="M6 9C5.44772 9 5 9.44772 5 10V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V10C19 9.44772 18.5523 9 18 9H6Z"
      fill="currentColor"
    />
    <path d="M10 13H14V15H10V13Z" fill="#FFFFFF" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M13 3C8.036 3 4 7.036 4 12H1L4.854 15.854L8.707 12H6C6 8.134 9.134 5 13 5C16.866 5 20 8.134 20 12C20 15.866 16.866 19 13 19H12V21H13C19.075 21 24 16.075 24 10C24 3.925 19.075 -1 13 -1V3Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path d="M13 8V13H18V11H14V8H13Z" fill="currentColor" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
      fill="currentColor"
    />
  </svg>
);

const SpeedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
      fill="currentColor"
      opacity="0.1"
    />
    <path
      d="M15.5 8.5L12 12L8.5 8.5L7 10L10.5 13.5L7 17L8.5 18.5L12 15L15.5 18.5L17 17L13.5 13.5L17 10L15.5 8.5Z"
      fill="currentColor"
    />
  </svg>
);

// New SVG Icon for Weather
const WeatherIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
      fill="#FACC15"
    />{' '}
    {/* Sun body */}
    <path
      d="M12 2V5M12 19V22M20.9239 9.07612L18.7925 11.2075M3.07612 14.9239L5.20753 12.7925M22 12H19M5 12H2M20.9239 14.9239L18.7925 12.7925M3.07612 9.07612L5.20753 11.2075"
      stroke="#FACC15"
      strokeWidth="2"
      strokeLinecap="round"
    />{' '}
    {/* Sun rays */}
  </svg>
);

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

// Chart data for vehicle performance
const PERFORMANCE_DATA = {
  labels: ['Engine', 'Fuel', 'Tires', 'Brakes', 'Battery'],
  datasets: [
    {
      label: 'Health (%)',
      data: [92, 76, 88, 95, 90],
      backgroundColor: '#2563eb',
      borderRadius: 8,
    },
  ],
};

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
