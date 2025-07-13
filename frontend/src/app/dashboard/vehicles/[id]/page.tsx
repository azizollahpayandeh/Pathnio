"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Truck, User, Gauge, Thermometer, Calendar, Settings } from "lucide-react";

const VEHICLE_DETAILS = {
  1: {
    id: 1,
    driver: "Amir",
    plate: "12A345-IR",
    model: "Volvo FH16",
    year: 2020,
    status: "Active",
    mileage: "120,000 km",
    service_due: "2024-09-15",
    tire_pressure: "32 PSI",
    engine_temp: "85°C",
    oil_pressure: "Normal",
    last_service: "2024-04-20",
    notes: "Vehicle in excellent condition with regular maintenance.",
  },
  2: {
    id: 2,
    driver: "Sara",
    plate: "22B456-IR",
    model: "Scania R450",
    year: 2018,
    status: "Under Maintenance",
    mileage: "180,500 km",
    service_due: "2024-07-20",
    tire_pressure: "30 PSI",
    engine_temp: "90°C",
    oil_pressure: "Low",
    last_service: "2024-03-10",
    notes: "Oil pressure issue detected, currently under repair.",
  },
  3: {
    id: 3,
    driver: "Mohammad",
    plate: "33C567-IR",
    model: "MAN TGX 18.440",
    year: 2019,
    status: "Active",
    mileage: "140,000 km",
    service_due: "2024-08-10",
    tire_pressure: "33 PSI",
    engine_temp: "82°C",
    oil_pressure: "Normal",
    last_service: "2024-05-15",
    notes: "Ready for long-distance trips.",
  }
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vehicleId = parseInt(params.id as string);
    const vehicleData = VEHICLE_DETAILS[vehicleId as keyof typeof VEHICLE_DETAILS];

    if (vehicleData) {
      setVehicle(vehicleData);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 text-lg font-semibold">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Vehicle Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/vehicles')}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 py-8 px-4">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push('/dashboard/vehicles')}
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-green-700 font-semibold px-6 py-3 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Vehicles
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-green-700 mb-4 bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
                Vehicle #{vehicle.id} - {vehicle.model}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Last Service: {new Date(vehicle.last_service).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{vehicle.plate}</div>
                <div className="text-sm text-gray-600">Plate Number</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{vehicle.year}</div>
                <div className="text-sm text-gray-600">Year</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{vehicle.mileage}</div>
                <div className="text-sm text-gray-600">Mileage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Driver Info */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-3">
              <User className="w-6 h-6" />
              Driver Information
            </h2>
            <div className="text-lg font-semibold text-teal-700">{vehicle.driver}</div>
          </div>

          {/* Maintenance Info */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6" />
              Maintenance
            </h2>
            <div className="space-y-2">
              <div><strong>Service Due:</strong> {vehicle.service_due}</div>
              <div><strong>Oil Pressure:</strong> {vehicle.oil_pressure}</div>
              <div><strong>Notes:</strong> {vehicle.notes}</div>
            </div>
          </div>

          {/* Engine Info */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-3">
              <Gauge className="w-6 h-6" />
              Engine Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-red-500" />
                <span>Engine Temperature: <strong>{vehicle.engine_temp}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Tire Pressure: <strong>{vehicle.tire_pressure}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
