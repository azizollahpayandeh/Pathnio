'use client';
import { useEffect, useState } from 'react';
import api from '../../api';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Eye,
  Phone,
  Car,
  Building,
  MapPin,
  Star,
  Clock,
  Navigation,
  MoreVertical,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
} from 'lucide-react';
import AddDriverModal from '@/components/AddDriverModal'; // Import the new modal component

interface Driver {
  id: number;
  name?: string;
  full_name?: string;
  mobile?: string;
  plate_number?: string;
  vehicle_type?: string;
  company?: { company_name: string };
  origin?: string;
  destination?: string;
  rating?: string;
  status?: string;
  last_trip?: string;
  total_trips?: number;
  experience?: string;
}

const FAKE_DRIVERS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  full_name: `Driver ${i + 1}`,
  mobile: `0912${100000 + i}`,
  plate_number: `12A${i}34-IR`,
  vehicle_type: i % 3 === 0 ? 'Sedan' : i % 3 === 1 ? 'Truck' : 'Van',
  company: { company_name: 'Demo Co.' },
  origin: 'Tehran',
  destination: i % 3 === 0 ? 'Isfahan' : i % 3 === 1 ? 'Shiraz' : 'Mashhad',
  rating: (4 + Math.random()).toFixed(1),
  status:
    i % 4 === 0
      ? 'active'
      : i % 4 === 1
      ? 'offline'
      : i % 4 === 2
      ? 'on_trip'
      : 'maintenance',
  last_trip: `${Math.floor(Math.random() * 7) + 1} days ago`,
  total_trips: Math.floor(Math.random() * 50) + 10,
  experience: `${Math.floor(Math.random() * 5) + 1} years`,
}));

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const router = useRouter();

  const fetchDrivers = () => {
    setLoading(true);
    api
      .get('accounts/drivers/')
      .then((res) => {
        console.log('Drivers API response:', res.data);
        const driversData = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.drivers || [];
        setDrivers(
          driversData.map((d: any) => ({
            ...d,
            origin: d.origin || 'Tehran',
            destination: d.destination || 'Isfahan',
            rating: (4 + Math.random()).toFixed(1),
            status: d.status || 'active',
            last_trip: `${Math.floor(Math.random() * 7) + 1} days ago`,
            total_trips: Math.floor(Math.random() * 50) + 10,
            experience: `${Math.floor(Math.random() * 5) + 1} years`,
          }))
        );
        setError(null);
      })
      .catch((err) => {
        console.error('Drivers API error:', err);
        setError('Failed to load drivers.');
        setDrivers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (newDriverData: Omit<Driver, 'id'>) => {
    try {
      // Assuming your API expects 'name' instead of 'full_name' for creation
      const payload = { ...newDriverData, name: newDriverData.full_name };
      const res = await api.post('accounts/drivers/', payload);
      console.log('Add Driver API response:', res.data);
      // Re-fetch drivers to include the newly added one
      fetchDrivers();
      setIsModalOpen(false); // Close the modal
    } catch (err) {
      console.error('Failed to add driver:', err);
      // You might want to show an error message to the user
    }
  };

  const statusConfig = {
    active: {
      label: 'Active',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
    offline: {
      label: 'Offline',
      color: 'bg-gray-100 text-gray-700',
      icon: XCircle,
    },
    on_trip: {
      label: 'On Trip',
      color: 'bg-blue-100 text-blue-700',
      icon: Navigation,
    },
    maintenance: {
      label: 'Maintenance',
      color: 'bg-orange-100 text-orange-700',
      icon: AlertCircle,
    },
  };

  const vehicleTypeConfig = {
    Sedan: { color: 'bg-blue-100 text-blue-700', icon: Car },
    Truck: { color: 'bg-purple-100 text-purple-700', icon: Car },
    Van: { color: 'bg-green-100 text-green-700', icon: Car },
  };

  const filteredDrivers = (
    error || drivers.length === 0 ? FAKE_DRIVERS : drivers
  ).filter(
    (driver) =>
      (driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        true) &&
      (selectedStatus === 'all' || driver.status === selectedStatus) &&
      (selectedVehicleType === 'all' ||
        driver.vehicle_type === selectedVehicleType)
  );

  const stats = {
    total: filteredDrivers.length,
    active: filteredDrivers.filter((d) => d.status === 'active').length,
    onTrip: filteredDrivers.filter((d) => d.status === 'on_trip').length,
    offline: filteredDrivers.filter((d) => d.status === 'offline').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">
                  Drivers Management
                </h1>
                <p className="text-gray-600 text-sm lg:text-lg">
                  Manage and monitor your fleet drivers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <button className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm lg:text-base">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm lg:text-base flex-1 lg:flex-none"
                onClick={() => setIsModalOpen(true)} // Open modal on click
              >
                <Plus className="w-4 h-4" />
                Add Driver
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {[
              {
                label: 'Total Drivers',
                value: stats.total,
                icon: Users,
                color: 'from-blue-500 to-indigo-600',
              },
              {
                label: 'Active',
                value: stats.active,
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-600',
              },
              {
                label: 'On Trip',
                value: stats.onTrip,
                icon: Navigation,
                color: 'from-purple-500 to-pink-600',
              },
              {
                label: 'Offline',
                value: stats.offline,
                icon: XCircle,
                color: 'from-gray-500 to-slate-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-4 lg:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div
                      className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600">
                        {stat.label}
                      </div>
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
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
              <option value="on_trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="all">All Vehicles</option>
              <option value="Sedan">Sedan</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
            </select>
          </div>
        </div>

        {/* Drivers Grid */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">
                Loading drivers...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Drivers
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver, index) => {
              const StatusIcon =
                statusConfig[driver.status as keyof typeof statusConfig]
                  ?.icon || CheckCircle;
              const VehicleIcon =
                vehicleTypeConfig[
                  driver.vehicle_type as keyof typeof vehicleTypeConfig
                ]?.icon || Car;

              return (
                <div
                  key={driver.id || index}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  onClick={() =>
                    !error &&
                    drivers.length > 0 &&
                    driver.id &&
                    router.push(`/dashboard/drivers/${driver.id}`)
                  }
                >
                  {/* Driver Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {driver.full_name}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            statusConfig[
                              driver.status as keyof typeof statusConfig
                            ]?.color
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {
                            statusConfig[
                              driver.status as keyof typeof statusConfig
                            ]?.label
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">
                        {driver.rating}
                      </span>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{driver.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <VehicleIcon className="w-4 h-4" />
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          vehicleTypeConfig[
                            driver.vehicle_type as keyof typeof vehicleTypeConfig
                          ]?.color
                        }`}
                      >
                        {driver.vehicle_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{driver.company?.company_name || 'Demo Co.'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {driver.origin} → {driver.destination}
                      </span>
                    </div>
                  </div>

                  {/* Driver Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Total Trips
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {driver.total_trips}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Experience
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {driver.experience}
                      </div>
                    </div>
                  </div>

                  {/* Last Trip */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Last trip: {driver.last_trip}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-between items-center">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        !error && drivers.length > 0 && driver.id
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!error && drivers.length > 0 && driver.id) {
                          router.push(`/dashboard/drivers/${driver.id}`);
                        }
                      }}
                      disabled={!!error || drivers.length === 0}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDrivers.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Drivers Found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 mx-auto"
                onClick={() => setIsModalOpen(true)} // Open modal on click
              >
                <Plus className="w-4 h-4" />
                Add New Driver
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      {isModalOpen && (
        <AddDriverModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddDriver={handleAddDriver}
        />
      )}
    </div>
  );
}
