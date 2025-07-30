'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  X,
  Check,
} from 'lucide-react';

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

// Modal props interface
interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (trip: Trip) => void;
}

const FAKE_TRIPS = [
  {
    id: 1,
    driver: 'Amir Rezaei',
    vehicle: '12A345-IR',
    origin: 'Tehran',
    destination: 'Isfahan',
    start: '2024-07-01 08:00',
    end: '2024-07-01 12:00',
    status: 'Completed',
    distance: '450 km',
    duration: '4h 0m',
    fuel_used: '36L',
    cost: '2,450,000',
    rating: 4.8,
    notes: 'Smooth trip, no issues',
  },
  {
    id: 2,
    driver: 'Sara Ahmadi',
    vehicle: '22B456-IR',
    origin: 'Shiraz',
    destination: 'Tabriz',
    start: '2024-07-02 09:00',
    end: '2024-07-02 15:00',
    status: 'Completed',
    distance: '1,200 km',
    duration: '6h 0m',
    fuel_used: '85L',
    cost: '4,800,000',
    rating: 4.5,
    notes: 'Long distance trip completed successfully',
  },
  {
    id: 3,
    driver: 'Mohammad Karimi',
    vehicle: '33C567-IR',
    origin: 'Mashhad',
    destination: 'Tehran',
    start: '2024-07-03 07:30',
    end: '2024-07-03 13:00',
    status: 'In Progress',
    distance: '900 km',
    duration: '5h 30m',
    fuel_used: '65L',
    cost: '3,600,000',
    rating: 0,
    notes: 'Currently en route',
  },
  {
    id: 4,
    driver: 'Reza Mohammadi',
    vehicle: '44D678-IR',
    origin: 'Isfahan',
    destination: 'Qom',
    start: '2024-07-04 10:00',
    end: '2024-07-04 14:00',
    status: 'Completed',
    distance: '300 km',
    duration: '4h 0m',
    fuel_used: '24L',
    cost: '1,800,000',
    rating: 4.9,
    notes: 'Excellent performance',
  },
  {
    id: 5,
    driver: 'Fatemeh Hosseini',
    vehicle: '55E789-IR',
    origin: 'Qom',
    destination: 'Mashhad',
    start: '2024-07-05 11:00',
    end: '2024-07-05 18:00',
    status: 'Cancelled',
    distance: '0 km',
    duration: '0h 0m',
    fuel_used: '0L',
    cost: '0',
    rating: 0,
    notes: 'Trip cancelled due to weather',
  },
  {
    id: 6,
    driver: 'Hossein Alavi',
    vehicle: '66F890-IR',
    origin: 'Tabriz',
    destination: 'Shiraz',
    start: '2024-07-06 06:00',
    end: '2024-07-06 13:00',
    status: 'Completed',
    distance: '1,500 km',
    duration: '7h 0m',
    fuel_used: '105L',
    cost: '6,000,000',
    rating: 4.7,
    notes: 'Long haul completed',
  },
  {
    id: 7,
    driver: 'Maryam Jafari',
    vehicle: '77G901-IR',
    origin: 'Tehran',
    destination: 'Isfahan',
    start: '2024-07-07 08:30',
    end: '2024-07-07 12:30',
    status: 'Completed',
    distance: '450 km',
    duration: '4h 0m',
    fuel_used: '38L',
    cost: '2,500,000',
    rating: 4.6,
    notes: 'Regular route trip',
  },
  {
    id: 8,
    driver: 'Ali Naderi',
    vehicle: '88H012-IR',
    origin: 'Mashhad',
    destination: 'Qom',
    start: '2024-07-08 09:00',
    end: '2024-07-08 15:00',
    status: 'In Progress',
    distance: '600 km',
    duration: '6h 0m',
    fuel_used: '45L',
    cost: '3,200,000',
    rating: 0,
    notes: 'Currently traveling',
  },
  {
    id: 9,
    driver: 'Zahra Kazemi',
    vehicle: '99I123-IR',
    origin: 'Isfahan',
    destination: 'Tehran',
    start: '2024-07-09 10:00',
    end: '2024-07-09 14:00',
    status: 'Completed',
    distance: '450 km',
    duration: '4h 0m',
    fuel_used: '35L',
    cost: '2,300,000',
    rating: 4.8,
    notes: 'Return trip completed',
  },
  {
    id: 10,
    driver: 'Alireza Sadeghi',
    vehicle: '10J234-IR',
    origin: 'Tehran',
    destination: 'Shiraz',
    start: '2024-07-10 07:00',
    end: '2024-07-10 13:00',
    status: 'Completed',
    distance: '900 km',
    duration: '6h 0m',
    fuel_used: '72L',
    cost: '4,100,000',
    rating: 4.9,
    notes: 'Excellent trip with great feedback',
  },
];

// Add Trip Modal Component
const AddTripModal = ({ isOpen, onClose, onAddTrip }: AddTripModalProps) => {
  const [formData, setFormData] = useState<Omit<Trip, 'id'>>({
    driver: '',
    vehicle: '',
    origin: '',
    destination: '',
    start: '',
    end: '',
    status: 'In Progress',
    distance: '',
    duration: '',
    fuel_used: '',
    cost: '',
    rating: 0,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newTrip: Trip = {
      ...formData,
      id: Date.now(),
      rating: Number(formData.rating) || 0,
    };

    onAddTrip(newTrip);

    // Reset form
    setFormData({
      driver: '',
      vehicle: '',
      origin: '',
      destination: '',
      start: '',
      end: '',
      status: 'In Progress',
      distance: '',
      duration: '',
      fuel_used: '',
      cost: '',
      rating: 0,
      notes: '',
    });

    setIsSubmitting(false);
    setCurrentStep(1);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative transform transition-all animate-in slide-in-from-bottom-4 duration-300 border border-gray-100 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Trip
              </h2>
              <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= currentStep
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                      step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Schedule</span>
            <span>Details</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter driver name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Plate *
                  </label>
                  <input
                    type="text"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter vehicle plate number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin City *
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter origin city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination City *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter destination city"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="start"
                    value={formData.start}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end"
                    value={formData.end}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance
                  </label>
                  <input
                    type="text"
                    name="distance"
                    value={formData.distance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 450 km"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 4h 30m"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Used
                  </label>
                  <input
                    type="text"
                    name="fuel_used"
                    value={formData.fuel_used}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 36L"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Cost
                  </label>
                  <input
                    type="text"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 2,450,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="0.0 - 5.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Add any notes about this trip..."
                />
              </div>

              {/* Review Section */}
              <div className="bg-gray-50 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Review Trip Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Driver:</span>
                    <span className="ml-2 font-medium">
                      {formData.driver || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="ml-2 font-medium">
                      {formData.vehicle || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Route:</span>
                    <span className="ml-2 font-medium">
                      {formData.origin && formData.destination
                        ? `${formData.origin} → ${formData.destination}`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{formData.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Trip...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Add Trip
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setTrips([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const handleAddTrip = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
  };

  const showTrips =
    trips.length >= 10
      ? trips.slice(0, 10)
      : [...trips, ...FAKE_TRIPS.slice(0, 10 - trips.length)];

  const filteredTrips = showTrips.filter(
    (trip) =>
      trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === 'all' || trip.status === selectedStatus) &&
      (selectedDriver === 'all' || trip.driver === selectedDriver)
  );

  const stats = {
    total: filteredTrips.length,
    completed: filteredTrips.filter((t) => t.status === 'Completed').length,
    inProgress: filteredTrips.filter((t) => t.status === 'In Progress').length,
    cancelled: filteredTrips.filter((t) => t.status === 'Cancelled').length,
  };

  const statusConfig = {
    Completed: {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
    },
    'In Progress': {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Clock,
    },
    Cancelled: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    },
  };

  const handleViewTrip = (tripId: number) => {
    router.push(`/dashboard/trips/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg">
                <Route className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Trips History
                </h1>
                <p className="text-gray-600 text-xs lg:text-base">
                  Track and analyze your fleet trips
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button className="flex items-center gap-1 px-2 lg:px-3 py-2 bg-gray-100 rounded-lg lg:rounded-xl hover:bg-gray-200 transition-all duration-200 text-xs lg:text-sm">
                <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 text-xs lg:text-sm flex-1 lg:flex-none"
              >
                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                New Trip
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
            {[
              {
                label: 'Total',
                value: stats.total,
                icon: Route,
                color: 'from-purple-500 to-pink-600',
              },
              {
                label: 'Completed',
                value: stats.completed,
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-600',
              },
              {
                label: 'In Progress',
                value: stats.inProgress,
                icon: Clock,
                color: 'from-blue-500 to-indigo-600',
              },
              {
                label: 'Cancelled',
                value: stats.cancelled,
                icon: XCircle,
                color: 'from-red-500 to-pink-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <div
                      className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${stat.color} rounded-lg lg:rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg lg:text-xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 lg:px-3 py-2 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="px-2 lg:px-3 py-2 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Drivers</option>
              {Array.from(new Set(showTrips.map((t) => t.driver))).map(
                (driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center py-8 lg:py-12">
              <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-base lg:text-lg text-gray-600">
                Loading trips...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-3 lg:p-6 border-b border-gray-100">
              <h2 className="text-base lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Route className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                Trip Records ({filteredTrips.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredTrips.map((trip, index) => {
                const StatusIcon =
                  statusConfig[trip.status as keyof typeof statusConfig]
                    ?.icon || CheckCircle;

                return (
                  <div
                    key={index}
                    className="p-3 lg:p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewTrip(trip.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
                      {/* Trip Info */}
                      <div className="flex items-start gap-3 lg:gap-6 flex-1">
                        {/* Trip Icon */}
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Route className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
                        </div>

                        {/* Main Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-4 mb-2">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                              Trip #{trip.id}
                            </h3>
                            <div className="flex flex-wrap gap-1 lg:gap-2">
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                                  statusConfig[
                                    trip.status as keyof typeof statusConfig
                                  ]?.color
                                }`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {trip.status}
                              </div>
                              {trip.rating && trip.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs font-semibold text-gray-700">
                                    {trip.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1 lg:gap-2">
                              <User className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">{trip.driver}</span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                              <Car className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">{trip.vehicle}</span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">
                                {trip.origin} → {trip.destination}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                              <Calendar className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">
                                {trip.start.split(' ')[0]}
                              </span>
                            </div>
                          </div>

                          {/* Mobile Trip Stats */}
                          <div className="flex items-center gap-4 mt-2 lg:hidden text-xs text-gray-500">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                {trip.distance}
                              </div>
                              <div>Distance</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                {trip.duration}
                              </div>
                              <div>Duration</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                {trip.cost}
                              </div>
                              <div>Cost</div>
                            </div>
                          </div>

                          {/* Desktop Trip Stats */}
                          <div className="hidden lg:grid grid-cols-4 gap-4 text-xs text-gray-500">
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
                      <div className="flex items-center gap-2 lg:gap-3 lg:ml-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTrip(trip.id);
                          }}
                          className="flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 text-xs lg:text-sm"
                        >
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button className="p-1 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                          <MoreVertical className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredTrips.length === 0 && (
              <div className="text-center py-8 lg:py-12">
                <Route className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                  No Trips Found
                </h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 mx-auto text-sm"
                >
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                  Create New Trip
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Trip Modal */}
        <AddTripModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTrip={handleAddTrip}
        />
      </div>
    </div>
  );
}
