'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car,
  Search,
  Plus,
  Eye,
  User,
  Building,
  Download,
  CheckCircle,
  XCircle,
  MoreVertical,
  Truck,
  Wrench,
  Palette,
  Weight,
} from 'lucide-react';
import AddVehicleModal from '@/components/AddVehicleModal';

// تعریف type مناسب برای Vehicle
interface Vehicle {
  plate_number: string;
  vehicle_type: string;
  driver: string;
  company: string;
  status: string;
  capacity: string;
  color: string;
  fuel_level?: string;
  last_maintenance?: string;
  total_trips?: number;
  efficiency?: string;
  mileage?: string;
}

const FAKE_VEHICLES = [
  {
    plate_number: '12A345-IR',
    vehicle_type: 'Truck',
    driver: 'Amir Rezaei',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '10t',
    color: 'White',
    fuel_level: '85%',
    last_maintenance: '2 weeks ago',
    total_trips: 156,
    efficiency: '8.2 L/100km',
    mileage: '45,230 km',
  },
  {
    plate_number: '22B456-IR',
    vehicle_type: 'Van',
    driver: 'Sara Ahmadi',
    company: 'Demo Co.',
    status: 'Inactive',
    capacity: '2t',
    color: 'Blue',
    fuel_level: '45%',
    last_maintenance: '1 month ago',
    total_trips: 89,
    efficiency: '6.8 L/100km',
    mileage: '32,150 km',
  },
  {
    plate_number: '33C567-IR',
    vehicle_type: 'Sedan',
    driver: 'Mohammad Karimi',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '5t',
    color: 'Black',
    fuel_level: '92%',
    last_maintenance: '1 week ago',
    total_trips: 234,
    efficiency: '7.1 L/100km',
    mileage: '67,890 km',
  },
  {
    plate_number: '44D678-IR',
    vehicle_type: 'Truck',
    driver: 'Reza Mohammadi',
    company: 'Demo Co.',
    status: 'Maintenance',
    capacity: '12t',
    color: 'Red',
    fuel_level: '12%',
    last_maintenance: 'Today',
    total_trips: 198,
    efficiency: '9.5 L/100km',
    mileage: '78,450 km',
  },
  {
    plate_number: '55E789-IR',
    vehicle_type: 'Van',
    driver: 'Fatemeh Hosseini',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '3t',
    color: 'Green',
    fuel_level: '78%',
    last_maintenance: '3 weeks ago',
    total_trips: 145,
    efficiency: '6.2 L/100km',
    mileage: '41,200 km',
  },
  {
    plate_number: '66F890-IR',
    vehicle_type: 'Sedan',
    driver: 'Hossein Alavi',
    company: 'Demo Co.',
    status: 'Inactive',
    capacity: '4t',
    color: 'Gray',
    fuel_level: '23%',
    last_maintenance: '2 months ago',
    total_trips: 67,
    efficiency: '7.8 L/100km',
    mileage: '28,900 km',
  },
  {
    plate_number: '77G901-IR',
    vehicle_type: 'Truck',
    driver: 'Maryam Jafari',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '15t',
    color: 'Yellow',
    fuel_level: '95%',
    last_maintenance: '5 days ago',
    total_trips: 267,
    efficiency: '10.2 L/100km',
    mileage: '89,120 km',
  },
  {
    plate_number: '88H012-IR',
    vehicle_type: 'Van',
    driver: 'Ali Naderi',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '2.5t',
    color: 'White',
    fuel_level: '67%',
    last_maintenance: '1 week ago',
    total_trips: 178,
    efficiency: '5.9 L/100km',
    mileage: '52,340 km',
  },
  {
    plate_number: '99I123-IR',
    vehicle_type: 'Sedan',
    driver: 'Zahra Kazemi',
    company: 'Demo Co.',
    status: 'Maintenance',
    capacity: '5t',
    color: 'Blue',
    fuel_level: '8%',
    last_maintenance: 'Today',
    total_trips: 123,
    efficiency: '7.3 L/100km',
    mileage: '38,760 km',
  },
  {
    plate_number: '10J234-IR',
    vehicle_type: 'Truck',
    driver: 'Alireza Sadeghi',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '20t',
    color: 'Black',
    fuel_level: '88%',
    last_maintenance: '2 weeks ago',
    total_trips: 312,
    efficiency: '11.5 L/100km',
    mileage: '95,670 km',
  },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setVehicles([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showVehicles =
    vehicles.length >= 10
      ? vehicles.slice(0, 10)
      : [...vehicles, ...FAKE_VEHICLES.slice(0, 10 - vehicles.length)];

  const filteredVehicles = showVehicles.filter(
    (vehicle) =>
      vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === 'all' || vehicle.status === selectedStatus) &&
      (selectedType === 'all' || vehicle.vehicle_type === selectedType)
  );

  const stats = {
    total: filteredVehicles.length,
    active: filteredVehicles.filter((v) => v.status === 'Active').length,
    inactive: filteredVehicles.filter((v) => v.status === 'Inactive').length,
    maintenance: filteredVehicles.filter((v) => v.status === 'Maintenance')
      .length,
  };

  const statusConfig = {
    Active: {
      color: 'bg-green-100 text-green-500 border-green-200',
      icon: CheckCircle,
    },
    Inactive: {
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle,
    },
    Maintenance: {
      color: 'bg-blue-100 text-blue-500 border-blue-200',
      icon: Wrench,
    },
  };

  const vehicleTypeConfig = {
    Truck: { color: 'bg-orange-100 text-orange-500', icon: Truck },
    Van: { color: 'bg-orange-100 text-orange-700', icon: Car },
    Sedan: { color: 'bg-orange-100 text-orange-700', icon: Car },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2 truncate">
                  Vehicles Management
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg hidden sm:block">
                  Monitor and manage your fleet vehicles
                </p>
                <p className="text-gray-600 text-xs sm:hidden">
                  Fleet management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <button className="flex items-center gap-1 sm:gap-2 px-3 lg:px-4 py-2 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm lg:text-base flex-1 sm:flex-none justify-center">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-orange-600 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base flex-1 sm:flex-none justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            {[
              {
                label: 'Total Vehicles',
                value: stats.total,
                icon: Car,
                color: 'from-orange-500 to-orange-600',
              },
              {
                label: 'Active',
                value: stats.active,
                icon: CheckCircle,
                color: 'from-green-500 to-green-600',
              },
              {
                label: 'Inactive',
                value: stats.inactive,
                icon: XCircle,
                color: 'from-gray-500 to-slate-600',
              },
              {
                label: 'Maintenance',
                value: stats.maintenance,
                icon: Wrench,
                color: 'from-blue-500 to-blue-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="text-right flex-1 min-w-0 ml-2">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm lg:text-sm text-gray-600 truncate">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm lg:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 sm:flex-none px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="all">All Types</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Sedan">Sedan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicles List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
              <span className="ml-3 text-base sm:text-lg text-gray-600">
                Loading vehicles...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Car className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
                <span className="hidden sm:inline">Fleet Vehicles ({filteredVehicles.length})</span>
                <span className="sm:hidden">Vehicles ({filteredVehicles.length})</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredVehicles.map((vehicle, index) => {
                const StatusIcon =
                  statusConfig[vehicle.status as keyof typeof statusConfig]
                    ?.icon || CheckCircle;
                const VehicleIcon =
                  vehicleTypeConfig[
                    vehicle.vehicle_type as keyof typeof vehicleTypeConfig
                  ]?.icon || Car;

                return (
                  <div
                    key={index}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/dashboard/vehicles/${encodeURIComponent(
                        vehicle.plate_number
                      )}`)
                    }
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                      {/* Main Vehicle Info Row */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                        {/* Vehicle Icon */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <VehicleIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-500" />
                        </div>

                        {/* Main Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                              {vehicle.plate_number}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <div
                                className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${
                                  statusConfig[
                                    vehicle.status as keyof typeof statusConfig
                                  ]?.color
                                }`}
                              >
                                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{vehicle.status}</span>
                                <span className="sm:hidden">{vehicle.status.slice(0, 3)}</span>
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                                  vehicleTypeConfig[
                                    vehicle.vehicle_type as keyof typeof vehicleTypeConfig
                                  ]?.color
                                }`}
                              >
                                <VehicleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                {vehicle.vehicle_type}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1 sm:gap-2 truncate">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{vehicle.driver}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 truncate">
                              <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{vehicle.company}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Weight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{vehicle.capacity}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Palette className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{vehicle.color}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Stats - Hidden on mobile */}
                      <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm text-gray-500">
                        <div className="text-center min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {vehicle.fuel_level}
                          </div>
                          <div className="text-xs">Fuel</div>
                        </div>
                        <div className="text-center min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {vehicle.total_trips}
                          </div>
                          <div className="text-xs">Trips</div>
                        </div>
                        <div className="text-center min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {vehicle.efficiency}
                          </div>
                          <div className="text-xs">Efficiency</div>
                        </div>
                        <div className="text-center min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {vehicle.mileage}
                          </div>
                          <div className="text-xs">Mileage</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:gap-3 lg:ml-4 w-full lg:w-auto">
                        <Link
                          href={`/dashboard/vehicles/${encodeURIComponent(
                            vehicle.plate_number
                          )}`}
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-orange-100 text-orange-500 rounded-lg sm:rounded-xl hover:bg-orange-200 transition-all duration-200 text-sm sm:text-base flex-1 lg:flex-none justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 sm:py-12 px-4">
                <Car className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Vehicles Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 mx-auto text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add New Vehicle
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddVehicleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddVehicle={(newVehicle) => {
            setVehicles([...vehicles, newVehicle]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
