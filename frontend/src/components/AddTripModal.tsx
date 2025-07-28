import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';

// Trip interface
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
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTrip: Trip = {
      ...formData,
      id: Date.now(), // موقتی برای ID
      rating: Number(formData.rating) || 0
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
      notes: ''
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
              <h2 className="text-xl font-semibold text-gray-900">Add New Trip</h2>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                    step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review Trip Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Driver:</span>
                    <span className="ml-2 font-medium">{formData.driver || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="ml-2 font-medium">{formData.vehicle || 'Not specified'}</span>
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

export default AddTripModal;