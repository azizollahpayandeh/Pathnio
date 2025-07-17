"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, User, Truck, Calendar, Navigation, Gauge, Thermometer } from "lucide-react";

// Static trip data for demonstration
const TRIP_DETAILS = {
  1: {
    id: 1,
    driver: "Amir",
    vehicle: "12A345-IR",
    origin: "Tehran",
    destination: "Isfahan",
    start: "2024-07-01 08:00",
    end: "2024-07-01 12:00",
    status: "Completed",
    distance: "450 km",
    duration: "4 hours",
    fuel_consumed: "45 liters",
    avg_speed: "112 km/h",
    max_speed: "130 km/h",
    stops: 2,
    cargo: "Electronics",
    weight: "2.5 tons",
    route: "Tehran → Qom → Kashan → Isfahan",
    notes: "Smooth journey with no issues. Driver maintained excellent speed and fuel efficiency.",
    weather: "Sunny",
    temperature: "28°C",
    road_conditions: "Good",
    traffic: "Light",
    fuel_efficiency: "10 km/l",
    engine_temp: "85°C",
    oil_pressure: "Normal",
    tire_pressure: "32 PSI",
    driver_rating: 4.8,
    vehicle_condition: "Excellent",
    maintenance_due: "2024-08-15"
  },
  2: {
    id: 2,
    driver: "Sara",
    vehicle: "22B456-IR",
    origin: "Shiraz",
    destination: "Tabriz",
    start: "2024-07-02 09:00",
    end: "2024-07-02 15:00",
    status: "Completed",
    distance: "780 km",
    duration: "6 hours",
    fuel_consumed: "78 liters",
    avg_speed: "130 km/h",
    max_speed: "145 km/h",
    stops: 3,
    cargo: "Textiles",
    weight: "3.2 tons",
    route: "Shiraz → Yazd → Kashan → Qom → Tehran → Tabriz",
    notes: "Long distance trip completed successfully. Driver took appropriate breaks.",
    weather: "Partly cloudy",
    temperature: "32°C",
    road_conditions: "Excellent",
    traffic: "Moderate",
    fuel_efficiency: "10 km/l",
    engine_temp: "88°C",
    oil_pressure: "Normal",
    tire_pressure: "34 PSI",
    driver_rating: 4.6,
    vehicle_condition: "Good",
    maintenance_due: "2024-07-20"
  },
  3: {
    id: 3,
    driver: "Mohammad",
    vehicle: "33C567-IR",
    origin: "Mashhad",
    destination: "Tehran",
    start: "2024-07-03 07:30",
    end: "2024-07-03 13:00",
    status: "In Progress",
    distance: "650 km",
    duration: "5.5 hours",
    fuel_consumed: "65 liters",
    avg_speed: "118 km/h",
    max_speed: "135 km/h",
    stops: 2,
    cargo: "Agricultural products",
    weight: "4.1 tons",
    route: "Mashhad → Semnan → Tehran",
    notes: "Currently en route. Driver is maintaining good speed and following safety protocols.",
    weather: "Clear",
    temperature: "25°C",
    road_conditions: "Good",
    traffic: "Heavy",
    fuel_efficiency: "10 km/l",
    engine_temp: "82°C",
    oil_pressure: "Normal",
    tire_pressure: "33 PSI",
    driver_rating: 4.7,
    vehicle_condition: "Excellent",
    maintenance_due: "2024-08-10"
  }
};

// Replace 'any' with a specific Trip type
interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  // Add more fields as needed
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tripId = parseInt(params.id as string);
    const tripData = TRIP_DETAILS[tripId as keyof typeof TRIP_DETAILS];
    
    if (tripData) {
      setTrip(tripData);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 text-lg font-semibold">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Trip Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/trips')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push('/dashboard/trips')}
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Trips
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-700 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trip #{trip.id}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(trip.status)}`}>
                  {trip.status}
                </span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(trip.start).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{trip.distance}</div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{trip.duration}</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{trip.avg_speed}</div>
                <div className="text-sm text-gray-600">Avg Speed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trip Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Route Information */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                <Navigation className="w-6 h-6" />
                Route Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Origin</div>
                      <div className="text-lg font-bold text-blue-600">{trip.origin}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Destination</div>
                      <div className="text-lg font-bold text-blue-600">{trip.destination}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Start Time</div>
                      <div className="text-lg font-bold text-blue-600">{trip.start}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-semibold text-gray-700">End Time</div>
                      <div className="text-lg font-bold text-blue-600">{trip.end}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="font-semibold text-blue-700 mb-2">Route Details:</div>
                <div className="text-gray-700">{trip.route}</div>
              </div>
            </div>

            {/* Driver & Vehicle Info */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                <User className="w-6 h-6" />
                Driver & Vehicle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Driver</div>
                      <div className="text-lg font-bold text-blue-600">{trip.driver}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Vehicle</div>
                      <div className="text-lg font-bold text-blue-600">{trip.vehicle}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">★</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Driver Rating</div>
                      <div className="text-lg font-bold text-blue-600">{trip.driver_rating}/5.0</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Vehicle Condition</div>
                      <div className="text-lg font-bold text-blue-600">{trip.vehicle_condition}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo Information */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Cargo Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{trip.cargo}</div>
                  <div className="text-sm text-gray-600">Cargo Type</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{trip.weight}</div>
                  <div className="text-sm text-gray-600">Weight</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{trip.stops}</div>
                  <div className="text-sm text-gray-600">Stops</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Speed</span>
                  <span className="font-bold text-blue-600">{trip.max_speed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fuel Efficiency</span>
                  <span className="font-bold text-green-600">{trip.fuel_efficiency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fuel Consumed</span>
                  <span className="font-bold text-orange-600">{trip.fuel_consumed}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Status */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Vehicle Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Engine Temp</span>
                  <span className="font-bold text-blue-600">{trip.engine_temp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Oil Pressure</span>
                  <span className="font-bold text-green-600">{trip.oil_pressure}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tire Pressure</span>
                  <span className="font-bold text-purple-600">{trip.tire_pressure}</span>
                </div>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4">Conditions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Weather</span>
                  <span className="font-bold text-blue-600">{trip.weather}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-bold text-orange-600">{trip.temperature}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Road Conditions</span>
                  <span className="font-bold text-green-600">{trip.road_conditions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Traffic</span>
                  <span className="font-bold text-purple-600">{trip.traffic}</span>
                </div>
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.7s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4">Maintenance</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                  <div className="text-lg font-bold text-orange-600">Next Service</div>
                  <div className="text-sm text-gray-600">{trip.maintenance_due}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Trip Notes</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <p className="text-gray-700 leading-relaxed">{trip.notes}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
} 