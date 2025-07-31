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
<<<<<<< HEAD
  LineChart,
  Calendar,
  RefreshCcw,
  TrendingUp,
  Activity,
  Zap,
  Shield,
=======
  Calendar,
  RefreshCcw,
  TrendingUp,
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
} from 'lucide-react';

// FAKE DATA - Replace with API in a real application
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
    capacity: '5t',
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

const VehiclePerformanceChart = dynamic(
  () => import('../../../../components/VehiclePerformanceChart'),
  { ssr: false }
);

export default function VehicleDetails() {
  const params = useParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const plate_number = decodeURIComponent(params.id as string);

  const vehicle = useMemo(
    () => FAKE_VEHICLES.find((v) => v.plate_number === plate_number),
    [plate_number]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h2>
              <p className="text-gray-600 mb-6">
                Vehicle with plate number{' '}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-sm">
                  {plate_number}
                </span>{' '}
                was not found in our database.
              </p>
          <button
            onClick={() => router.push('/dashboard/vehicles')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
                <ArrowLeft className="w-5 h-5" />
                Back to Vehicles
          </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    Active: {
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    Inactive: {
      bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: XCircle,
      iconColor: 'text-gray-500',
    },
    Maintenance: {
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: Clock,
      iconColor: 'text-yellow-500',
    },
  };

  const status = statusConfig[vehicle.status as keyof typeof statusConfig];

  interface DetailCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    gradient?: string;
  }

  const DetailCard = ({ icon: Icon, label, value, gradient = 'from-blue-50 to-indigo-50' }: DetailCardProps) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.push('/dashboard/vehicles')}
            className="group inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:bg-white/90"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Vehicles
          </button>
        </div>

        {/* Main Vehicle Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
          {/* Vehicle Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30 shadow-xl">
                    <Car className="w-12 h-12 text-white" />
              </div>
              <div>
                    <h1 className="text-4xl font-bold mb-2">{vehicle.plate_number}</h1>
                    <p className="text-xl text-blue-100 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {vehicle.vehicle_type}
                </p>
              </div>
                </div>
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${status.bg} ${status.border} border shadow-lg`}>
                  <status.icon className={`w-5 h-5 ${status.iconColor}`} />
                  <span className={`font-semibold ${status.text}`}>{vehicle.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <DetailCard icon={User} label="Driver" value={vehicle.driver} gradient="from-emerald-50 to-teal-50" />
              <DetailCard icon={Building} label="Company" value={vehicle.company} gradient="from-purple-50 to-violet-50" />
              <DetailCard icon={Package} label="Capacity" value={vehicle.capacity} gradient="from-orange-50 to-amber-50" />
              <DetailCard icon={Palette} label="Color" value={vehicle.color} gradient="from-pink-50 to-rose-50" />
              <DetailCard icon={MapPin} label="Last Location" value={vehicle.last_location} gradient="from-cyan-50 to-blue-50" />
              <DetailCard icon={CalendarDays} label="Next Service" value={vehicle.next_service} gradient="from-yellow-50 to-orange-50" />
              <DetailCard icon={Gauge} label="Mileage" value={vehicle.mileage} gradient="from-green-50 to-emerald-50" />
              <DetailCard icon={BatteryCharging} label="Fuel Level" value={vehicle.fuel_level} gradient="from-red-50 to-pink-50" />
            </div>

            {/* Performance Section */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Performance Analytics</h3>
                    <p className="text-gray-600">Real-time vehicle performance metrics</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4" />
                Last 7 Days
              </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium text-gray-700">
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
              </button>
                </div>
              </div>
              
              <VehiclePerformanceChart />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
}