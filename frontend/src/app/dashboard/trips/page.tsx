"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Route, 
  Search, 
  Plus, 
  Eye, 
  User, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  CheckCircle,
  XCircle,
  MoreVertical,
  Navigation,
  Star,
  DollarSign,
  Zap,
} from "lucide-react";

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
  distance?: string;
  duration?: string;
  fuel_used?: string;
  cost?: string;
  rating?: number;
  notes?: string;
}

const FAKE_TRIPS = [
  { id: 1, driver: "Amir Rezaei", vehicle: "12A345-IR", origin: "Tehran", destination: "Isfahan", start: "2024-07-01 08:00", end: "2024-07-01 12:00", status: "Completed", distance: "450 km", duration: "4h 0m", fuel_used: "36L", cost: "2,450,000", rating: 4.8, notes: "Smooth trip, no issues" },
  { id: 2, driver: "Sara Ahmadi", vehicle: "22B456-IR", origin: "Shiraz", destination: "Tabriz", start: "2024-07-02 09:00", end: "2024-07-02 15:00", status: "Completed", distance: "1,200 km", duration: "6h 0m", fuel_used: "85L", cost: "4,800,000", rating: 4.5, notes: "Long distance trip completed successfully" },
  { id: 3, driver: "Mohammad Karimi", vehicle: "33C567-IR", origin: "Mashhad", destination: "Tehran", start: "2024-07-03 07:30", end: "2024-07-03 13:00", status: "In Progress", distance: "900 km", duration: "5h 30m", fuel_used: "65L", cost: "3,600,000", rating: 0, notes: "Currently en route" },
  { id: 4, driver: "Reza Mohammadi", vehicle: "44D678-IR", origin: "Isfahan", destination: "Qom", start: "2024-07-04 10:00", end: "2024-07-04 14:00", status: "Completed", distance: "300 km", duration: "4h 0m", fuel_used: "24L", cost: "1,800,000", rating: 4.9, notes: "Excellent performance" },
  { id: 5, driver: "Fatemeh Hosseini", vehicle: "55E789-IR", origin: "Qom", destination: "Mashhad", start: "2024-07-05 11:00", end: "2024-07-05 18:00", status: "Cancelled", distance: "0 km", duration: "0h 0m", fuel_used: "0L", cost: "0", rating: 0, notes: "Trip cancelled due to weather" },
  { id: 6, driver: "Hossein Alavi", vehicle: "66F890-IR", origin: "Tabriz", destination: "Shiraz", start: "2024-07-06 06:00", end: "2024-07-06 13:00", status: "Completed", distance: "1,500 km", duration: "7h 0m", fuel_used: "105L", cost: "6,000,000", rating: 4.7, notes: "Long haul completed" },
  { id: 7, driver: "Maryam Jafari", vehicle: "77G901-IR", origin: "Tehran", destination: "Isfahan", start: "2024-07-07 08:30", end: "2024-07-07 12:30", status: "Completed", distance: "450 km", duration: "4h 0m", fuel_used: "38L", cost: "2,500,000", rating: 4.6, notes: "Regular route trip" },
  { id: 8, driver: "Ali Naderi", vehicle: "88H012-IR", origin: "Mashhad", destination: "Qom", start: "2024-07-08 09:00", end: "2024-07-08 15:00", status: "In Progress", distance: "600 km", duration: "6h 0m", fuel_used: "45L", cost: "3,200,000", rating: 0, notes: "Currently traveling" },
  { id: 9, driver: "Zahra Kazemi", vehicle: "99I123-IR", origin: "Isfahan", destination: "Tehran", start: "2024-07-09 10:00", end: "2024-07-09 14:00", status: "Completed", distance: "450 km", duration: "4h 0m", fuel_used: "35L", cost: "2,300,000", rating: 4.8, notes: "Return trip completed" },
  { id: 10, driver: "Alireza Sadeghi", vehicle: "10J234-IR", origin: "Tehran", destination: "Shiraz", start: "2024-07-10 07:00", end: "2024-07-10 13:00", status: "Completed", distance: "900 km", duration: "6h 0m", fuel_used: "72L", cost: "4,100,000", rating: 4.9, notes: "Excellent trip with great feedback" },
];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState("all");
  const router = useRouter();

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setTrips([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showTrips = trips.length >= 10 ? trips.slice(0, 10) : [...trips, ...FAKE_TRIPS.slice(0, 10 - trips.length)];

  const filteredTrips = showTrips.filter(trip => 
    trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === "all" || trip.status === selectedStatus) &&
    (selectedDriver === "all" || trip.driver === selectedDriver)
  );

  const stats = {
    total: filteredTrips.length,
    completed: filteredTrips.filter(t => t.status === "Completed").length,
    inProgress: filteredTrips.filter(t => t.status === "In Progress").length,
    cancelled: filteredTrips.filter(t => t.status === "Cancelled").length,
  };

  const statusConfig = {
    Completed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    "In Progress": { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    Cancelled: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  const handleViewTrip = (tripId: number) => {
    router.push(`/dashboard/trips/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Route className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Trips History</h1>
                <p className="text-gray-600 text-lg">Track and analyze your fleet trips</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                <Plus className="w-4 h-4" />
                New Trip
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { label: "Total Trips", value: stats.total, icon: Route, color: "from-purple-500 to-pink-600" },
              { label: "Completed", value: stats.completed, icon: CheckCircle, color: "from-green-500 to-emerald-600" },
              { label: "In Progress", value: stats.inProgress, icon: Clock, color: "from-blue-500 to-indigo-600" },
              { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "from-red-500 to-pink-600" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
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
                placeholder="Search trips by driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Drivers</option>
              {Array.from(new Set(showTrips.map(t => t.driver))).map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading trips...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Route className="w-6 h-6 text-purple-500" />
                Trip Records ({filteredTrips.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredTrips.map((trip, index) => {
                const StatusIcon = statusConfig[trip.status as keyof typeof statusConfig]?.icon || CheckCircle;
                
                return (
                  <div
                    key={index}
                    className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewTrip(trip.id)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Trip Info */}
                      <div className="flex items-center gap-6 flex-1">
                        {/* Trip Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                          <Route className="w-8 h-8 text-purple-600" />
                        </div>
                        
                        {/* Main Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">Trip #{trip.id}</h3>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${statusConfig[trip.status as keyof typeof statusConfig]?.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {trip.status}
                            </div>
                            {trip.rating && trip.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-semibold text-gray-700">{trip.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{trip.driver}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4" />
                              <span>{trip.vehicle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{trip.origin} → {trip.destination}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{trip.start.split(' ')[0]}</span>
                            </div>
                          </div>

                          {/* Trip Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              <span>{trip.distance}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{trip.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>{trip.fuel_used}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{trip.cost}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 ml-6">
                          <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTrip(trip.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                            View
                          </button>
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
            {filteredTrips.length === 0 && (
              <div className="text-center py-12">
                <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trips Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 mx-auto">
                  <Plus className="w-4 h-4" />
                  Create New Trip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 