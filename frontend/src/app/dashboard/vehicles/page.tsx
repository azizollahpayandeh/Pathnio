"use client";
import { useEffect, useState } from "react";
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
} from "lucide-react";

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
  { plate_number: "12A345-IR", vehicle_type: "Truck", driver: "Amir Rezaei", company: "Demo Co.", status: "Active", capacity: "10t", color: "White", fuel_level: "85%", last_maintenance: "2 weeks ago", total_trips: 156, efficiency: "8.2 L/100km", mileage: "45,230 km" },
  { plate_number: "22B456-IR", vehicle_type: "Van", driver: "Sara Ahmadi", company: "Demo Co.", status: "Inactive", capacity: "2t", color: "Blue", fuel_level: "45%", last_maintenance: "1 month ago", total_trips: 89, efficiency: "6.8 L/100km", mileage: "32,150 km" },
  { plate_number: "33C567-IR", vehicle_type: "Sedan", driver: "Mohammad Karimi", company: "Demo Co.", status: "Active", capacity: "5t", color: "Black", fuel_level: "92%", last_maintenance: "1 week ago", total_trips: 234, efficiency: "7.1 L/100km", mileage: "67,890 km" },
  { plate_number: "44D678-IR", vehicle_type: "Truck", driver: "Reza Mohammadi", company: "Demo Co.", status: "Maintenance", capacity: "12t", color: "Red", fuel_level: "12%", last_maintenance: "Today", total_trips: 198, efficiency: "9.5 L/100km", mileage: "78,450 km" },
  { plate_number: "55E789-IR", vehicle_type: "Van", driver: "Fatemeh Hosseini", company: "Demo Co.", status: "Active", capacity: "3t", color: "Green", fuel_level: "78%", last_maintenance: "3 weeks ago", total_trips: 145, efficiency: "6.2 L/100km", mileage: "41,200 km" },
  { plate_number: "66F890-IR", vehicle_type: "Sedan", driver: "Hossein Alavi", company: "Demo Co.", status: "Inactive", capacity: "4t", color: "Gray", fuel_level: "23%", last_maintenance: "2 months ago", total_trips: 67, efficiency: "7.8 L/100km", mileage: "28,900 km" },
  { plate_number: "77G901-IR", vehicle_type: "Truck", driver: "Maryam Jafari", company: "Demo Co.", status: "Active", capacity: "15t", color: "Yellow", fuel_level: "95%", last_maintenance: "5 days ago", total_trips: 267, efficiency: "10.2 L/100km", mileage: "89,120 km" },
  { plate_number: "88H012-IR", vehicle_type: "Van", driver: "Ali Naderi", company: "Demo Co.", status: "Active", capacity: "2.5t", color: "White", fuel_level: "67%", last_maintenance: "1 week ago", total_trips: 178, efficiency: "5.9 L/100km", mileage: "52,340 km" },
  { plate_number: "99I123-IR", vehicle_type: "Sedan", driver: "Zahra Kazemi", company: "Demo Co.", status: "Maintenance", capacity: "5t", color: "Blue", fuel_level: "8%", last_maintenance: "Today", total_trips: 123, efficiency: "7.3 L/100km", mileage: "38,760 km" },
  { plate_number: "10J234-IR", vehicle_type: "Truck", driver: "Alireza Sadeghi", company: "Demo Co.", status: "Active", capacity: "20t", color: "Black", fuel_level: "88%", last_maintenance: "2 weeks ago", total_trips: 312, efficiency: "11.5 L/100km", mileage: "95,670 km" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setVehicles([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showVehicles = vehicles.length >= 10 ? vehicles.slice(0, 10) : [...vehicles, ...FAKE_VEHICLES.slice(0, 10 - vehicles.length)];

  const filteredVehicles = showVehicles.filter(vehicle => 
    vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === "all" || vehicle.status === selectedStatus) &&
    (selectedType === "all" || vehicle.vehicle_type === selectedType)
  );

  const stats = {
    total: filteredVehicles.length,
    active: filteredVehicles.filter(v => v.status === "Active").length,
    inactive: filteredVehicles.filter(v => v.status === "Inactive").length,
    maintenance: filteredVehicles.filter(v => v.status === "Maintenance").length,
  };

  const statusConfig = {
    Active: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    Inactive: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle },
    Maintenance: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: Wrench },
  };

  const vehicleTypeConfig = {
    Truck: { color: "bg-purple-100 text-purple-700", icon: Truck },
    Van: { color: "bg-blue-100 text-blue-700", icon: Car },
    Sedan: { color: "bg-green-100 text-green-700", icon: Car },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Vehicles Management</h1>
                <p className="text-gray-600 text-lg">Monitor and manage your fleet vehicles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { label: "Total Vehicles", value: stats.total, icon: Car, color: "from-green-500 to-emerald-600" },
              { label: "Active", value: stats.active, icon: CheckCircle, color: "from-blue-500 to-indigo-600" },
              { label: "Inactive", value: stats.inactive, icon: XCircle, color: "from-gray-500 to-slate-600" },
              { label: "Maintenance", value: stats.maintenance, icon: Wrench, color: "from-orange-500 to-red-600" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-green-50 rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vehicles by plate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Sedan">Sedan</option>
            </select>
          </div>
        </div>

        {/* Vehicles List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading vehicles...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Car className="w-6 h-6 text-green-500" />
                Fleet Vehicles ({filteredVehicles.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredVehicles.map((vehicle, index) => {
                const StatusIcon = statusConfig[vehicle.status as keyof typeof statusConfig]?.icon || CheckCircle;
                const VehicleIcon = vehicleTypeConfig[vehicle.vehicle_type as keyof typeof vehicleTypeConfig]?.icon || Car;
                
                return (
                  <div
                    key={index}
                    className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/vehicles/${encodeURIComponent(vehicle.plate_number)}`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Vehicle Info */}
                      <div className="flex items-center gap-6 flex-1">
                        {/* Vehicle Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                          <VehicleIcon className="w-8 h-8 text-green-600" />
                        </div>
                        
                        {/* Main Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{vehicle.plate_number}</h3>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${statusConfig[vehicle.status as keyof typeof statusConfig]?.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {vehicle.status}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${vehicleTypeConfig[vehicle.vehicle_type as keyof typeof vehicleTypeConfig]?.color}`}>
                              <VehicleIcon className="w-4 h-4" />
                              {vehicle.vehicle_type}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{vehicle.driver}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{vehicle.company}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Weight className="w-4 h-4" />
                              <span>{vehicle.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              <span>{vehicle.color}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Stats */}
                      <div className="hidden lg:flex items-center gap-6 text-sm text-gray-500">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{vehicle.fuel_level}</div>
                          <div className="text-xs">Fuel</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{vehicle.total_trips}</div>
                          <div className="text-xs">Trips</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{vehicle.efficiency}</div>
                          <div className="text-xs">Efficiency</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{vehicle.mileage}</div>
                          <div className="text-xs">Mileage</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 ml-6">
                        <Link 
                          href={`/dashboard/vehicles/${encodeURIComponent(vehicle.plate_number)}`}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                            View
                          </Link>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
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
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add New Vehicle
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
