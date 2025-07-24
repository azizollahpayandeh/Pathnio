'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Car,
  User,
  Building,
  Package,
  Palette,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CalendarDays,
  Gauge,
  BatteryCharging,
  LineChart, // New icon for chart section
  Calendar, // New icon for date range selection
  RefreshCcw, // New icon for refresh
} from 'lucide-react'; // Lucide icons for richer details

// FAKE DATA - Replace with API in a real application
// This array simulates a database of vehicle information.
const FAKE_VEHICLES = [
  {
    plate_number: '12A345-IR',
    vehicle_type: 'Truck',
    driver: 'Amir Rezaei',
    company: 'Pishro Transport Co.',
    status: 'Active',
    capacity: '10t',
    color: 'White',
    last_location: 'Tehran, Azadi St.',
    next_service: '2025-08-15',
    mileage: '150,000 km',
    fuel_level: '85%',
    engine_type: 'Diesel',
  },
  {
    plate_number: '22B456-IR',
    vehicle_type: 'Van',
    driver: 'Sara Karimi',
    company: 'Alborz Express Post',
    status: 'Inactive',
    capacity: '2t',
    color: 'Blue',
    last_location: 'Isfahan, Naqsh-e Jahan Square',
    next_service: '2025-07-28',
    mileage: '80,000 km',
    fuel_level: '20%',
    engine_type: 'Gasoline',
  },
  {
    plate_number: '33C567-IR',
    vehicle_type: 'Sedan',
    driver: 'Mohammad Ahmadi',
    company: 'Smart Logistics',
    status: 'Active',
    capacity: '5t', // Capacity for a sedan might refer to cargo capacity
    color: 'Black',
    last_location: 'Shiraz, Darvazeh Quran',
    next_service: '2025-09-01',
    mileage: '210,000 km',
    fuel_level: '60%',
    engine_type: 'Hybrid',
  },
  {
    plate_number: '44D678-IR',
    vehicle_type: 'Truck',
    driver: 'Reza Hosseini',
    company: 'Novin Transit',
    status: 'Maintenance',
    capacity: '12t',
    color: 'Red',
    last_location: 'Mashhad, Holy Shrine',
    next_service: '2025-07-25',
    mileage: '300,000 km',
    fuel_level: '10%',
    engine_type: 'Diesel',
  },
  {
    plate_number: '55E789-IR',
    vehicle_type: 'Van',
    driver: 'Fatemeh Yousefi',
    company: 'Badpa Courier',
    status: 'Active',
    capacity: '3t',
    color: 'Green',
    last_location: 'Tabriz, Central Bazaar',
    next_service: '2025-10-10',
    mileage: '95,000 km',
    fuel_level: '90%',
    engine_type: 'Gasoline',
  },
  {
    plate_number: '66F890-IR',
    vehicle_type: 'Sedan',
    driver: 'Hossein Mohammadi',
    company: 'Dynamic Solutions',
    status: 'Inactive',
    capacity: '4t',
    color: 'Gray',
    last_location: 'Karaj, Azimieh',
    next_service: '2025-08-05',
    mileage: '180,000 km',
    fuel_level: '40%',
    engine_type: 'Gasoline',
  },
  {
    plate_number: '77G901-IR',
    vehicle_type: 'Truck',
    driver: 'Maryam Norouzi',
    company: 'Omid Transport',
    status: 'Active',
    capacity: '15t',
    color: 'Yellow',
    last_location: 'Yazd, Amir Chakhmaq Square',
    next_service: '2025-11-20',
    mileage: '250,000 km',
    fuel_level: '75%',
    engine_type: 'Diesel',
  },
  {
    plate_number: '88H012-IR',
    vehicle_type: 'Van',
    driver: 'Ali Fallah',
    company: 'Fast Shipping',
    status: 'Active',
    capacity: '2.5t',
    color: 'White',
    last_location: 'Qazvin, Ali Qapu',
    next_service: '2025-09-15',
    mileage: '70,000 km',
    fuel_level: '50%',
    engine_type: 'Gasoline',
  },
  {
    plate_number: '99I123-IR',
    vehicle_type: 'Sedan',
    driver: 'Zahra Mirzaei',
    company: 'Logistics Services',
    status: 'Maintenance',
    capacity: '5t',
    color: 'Blue',
    last_location: 'Rasht, Sabzeh Meydan',
    next_service: '2025-07-30',
    mileage: '120,000 km',
    fuel_level: '30%',
    engine_type: 'Gasoline',
  },
  {
    plate_number: '10J234-IR',
    vehicle_type: 'Truck',
    driver: 'Alireza Hassani',
    company: 'Etemad Carriers',
    status: 'Active',
    capacity: '20t',
    color: 'Black',
    last_location: 'Ahvaz, White Bridge',
    next_service: '2025-12-01',
    mileage: '400,000 km',
    fuel_level: '95%',
    engine_type: 'Diesel',
  },
];

// Dynamically import VehiclePerformanceChart to prevent Server-Side Rendering (SSR) issues.
// This ensures the component is only loaded on the client side.
const VehiclePerformanceChart = dynamic(
  () => import('../../../../components/VehiclePerformanceChart'),
  { ssr: false }
);

// Main component for displaying Vehicle Details
export default function VehicleDetails() {
  const params = useParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // For controlling page entry animation

  // Decode the plate number from the URL parameter.
  const plate_number = decodeURIComponent(params.id as string);

  // Use useMemo to find the vehicle details from the FAKE_VEHICLES data.
  // This memoizes the result, preventing unnecessary re-calculations on re-renders.
  const vehicle = useMemo(
    () => FAKE_VEHICLES.find((v) => v.plate_number === plate_number),
    [plate_number]
  );

  // Activate the page entry animation after the component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If no vehicle is found with the given plate number, display an error message.
  if (!vehicle) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center justify-center font-[Inter,sans-serif] text-gray-800">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-100 animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-red-600 mb-4">Error!</h2>
          <p className="text-xl text-gray-700">Vehicle with plate number <span className="font-mono bg-gray-100 p-1 rounded">{plate_number}</span> not found.</p>
          <button
            onClick={() => router.push('/dashboard/vehicles')}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-lg font-bold bg-blue-600 text-white shadow-md transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Vehicles List
          </button>
        </div>
      </div>
    );
  }

  // Tailwind CSS classes for conditional status coloring
  const statusClasses = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    Maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  // Helper component for displaying a single detail item
  // This smaller component makes the code cleaner and more reusable.
  interface DetailItemProps {
    icon: React.ElementType; // Lucide icon component
    label: string;
    value: string;
  }

  const DetailItem = ({ icon: Icon, label, value }: DetailItemProps) => (
    <div>
      <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </div>
      <div className="font-bold text-lg text-blue-900">{value}</div>
    </div>
  );

  // Render the vehicle details page layout
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-white min-h-screen flex flex-col pt-16 pb-8 px-4 sm:px-6 lg:px-8 font-[Inter,sans-serif] text-gray-800 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in-up">
        {/* Back Button Section */}
        <div className="relative">
          <button
            onClick={() => router.push('/dashboard/vehicles')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-blue-600 shadow-xl border border-blue-100 transition-all duration-300 ease-in-out hover:text-blue-800 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Vehicles
          </button>
        </div>

        {/* Vehicle Details Card Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 md:gap-12 border border-blue-100 min-h-[420px] relative overflow-hidden transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.005]">
          {/* Background graphic effect */}
          <div className="absolute inset-0 bg-[url('/images/grid-lines-blue.svg')] opacity-5 z-0 animate-pulse-slow" />
          
          {/* Left side: Main vehicle details (plate number, type, driver, etc.) */}
          <div className="relative z-10 flex-1 flex flex-col gap-6 justify-center">
            <div className="flex items-center gap-6 mb-4">
              {/* Circular display for the first two characters of the plate number */}
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-5xl font-extrabold text-blue-800 shadow-xl border-4 border-blue-200 animate-scale-in">
                {vehicle.plate_number.slice(0, 2)}
              </div>
              {/* Full plate number and vehicle type */}
              <div>
                <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight mb-1">
                  {vehicle.plate_number}
                </h1>
                <p className="text-xl text-gray-600 flex items-center gap-2">
                  <Car className="h-6 w-6 text-blue-500" />
                  {vehicle.vehicle_type}
                </p>
              </div>
            </div>
            {/* Grid layout for additional vehicle details like Driver, Company, Status, Capacity, Color, etc. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {/* Driver Information */}
              <DetailItem icon={User} label="Driver" value={vehicle.driver} />
              {/* Company Information */}
              <DetailItem icon={Building} label="Company" value={vehicle.company} />
              {/* Vehicle Status with conditional text coloring based on status value */}
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Status
                </div>
                <div className={`font-bold text-lg px-3 py-1 rounded-full inline-flex items-center gap-2 border ${statusClasses[vehicle.status as keyof typeof statusClasses]}`}>
                  {vehicle.status === 'Active' && <CheckCircle className="h-4 w-4" />}
                  {vehicle.status === 'Inactive' && <XCircle className="h-4 w-4" />}
                  {vehicle.status === 'Maintenance' && <Clock className="h-4 w-4" />}
                  {vehicle.status}
                </div>
              </div>
              {/* Vehicle Capacity */}
              <DetailItem icon={Package} label="Capacity" value={vehicle.capacity} />
              {/* Vehicle Color */}
              <DetailItem icon={Palette} label="Color" value={vehicle.color} />
              {/* Last Location */}
              <DetailItem icon={MapPin} label="Last Location" value={vehicle.last_location} />
              {/* Next Service Date */}
              <DetailItem icon={CalendarDays} label="Next Service" value={vehicle.next_service} />
              {/* Mileage */}
              <DetailItem icon={Gauge} label="Mileage" value={vehicle.mileage} />
              {/* Fuel Level */}
              <DetailItem icon={BatteryCharging} label="Fuel Level" value={vehicle.fuel_level} />
              {/* Engine Type */}
              <DetailItem icon={Car} label="Engine Type" value={vehicle.engine_type} />
            </div>
          </div>
          {/* Right side: Placeholder for Vehicle Performance Chart - ENHANCED */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 md:p-6 shadow-inner border border-gray-100 overflow-hidden">
            <LineChart className="h-16 w-16 text-blue-300 mb-4 opacity-70" /> {/* Larger icon */}
            <h3 className="text-xl sm:text-2xl font-bold text-blue-700 mb-2">Vehicle Performance Overview</h3>
            <p className="text-gray-600 text-sm text-center mb-6 max-w-sm">
              Visualize key metrics like fuel consumption, distance covered, and speed over time.
            </p>
            <VehiclePerformanceChart /> {/* Actual chart component */}

            {/* Mock interactive controls for the chart */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200">
                <Calendar className="h-4 w-4" />
                Last 7 Days
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200">
                <Calendar className="h-4 w-4" />
                Last 30 Days
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200">
                <RefreshCcw className="h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulseSlow {
          0% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.1;
          }
          100% {
            opacity: 0.05;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}