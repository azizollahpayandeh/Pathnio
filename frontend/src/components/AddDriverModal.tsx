'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Car,
  Building,
  MapPin,
  Star,
  Clock,
  Route,
  Check,
} from 'lucide-react';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driverData: Omit<Driver, 'id'>) => void;
}

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

const AddDriverModal: React.FC<AddDriverModalProps> = ({
  isOpen,
  onClose,
  onAddDriver,
}) => {
  const [formData, setFormData] = useState<Omit<Driver, 'id'>>({
    full_name: '',
    mobile: '',
    plate_number: '',
    vehicle_type: 'Sedan',
    company: { company_name: '' },
    origin: '',
    destination: '',
    rating: '5.0',
    status: 'active',
    last_trip: 'Today',
    total_trips: 0,
    experience: '0 years',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'company_name') {
      setFormData((prev) => ({
        ...prev,
        company: { company_name: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onAddDriver(formData);
    setFormData({
      full_name: '',
      mobile: '',
      plate_number: '',
      vehicle_type: 'Sedan',
      company: { company_name: '' },
      origin: '',
      destination: '',
      rating: '5.0',
      status: 'active',
      last_trip: 'Today',
      total_trips: 0,
      experience: '0 years',
    });
    setIsSubmitting(false);
    setCurrentStep(1);
  };

  const vehicleTypes = [
    { value: 'Sedan', label: 'Sedan', color: 'bg-blue-100 text-blue-700' },
    { value: 'Truck', label: 'Truck', color: 'bg-purple-100 text-purple-700' },
    { value: 'Van', label: 'Van', color: 'bg-green-100 text-green-700' },
  ];

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
        {/* Modal Container - matching dashboard style */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative transform transition-all animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
          {/* Header - matching dashboard header style */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Driver
                </h2>
                <p className="text-sm text-gray-500">
                  Manage and monitor your fleet drivers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="text-sm font-medium">Basic Info</span>
                </div>
                <div
                  className={`w-16 h-0.5 ${
                    currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-sm font-medium">Vehicle & Route</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label
                      htmlFor="full_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Driver Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter driver's full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="0912000001"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company?.company_name || ''}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Demo Co."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle & Route Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label
                      htmlFor="plate_number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Plate Number
                    </label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="plate_number"
                        name="plate_number"
                        value={formData.plate_number}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="12A34-IR"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Vehicle Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {vehicleTypes.map((type) => (
                        <label key={type.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="vehicle_type"
                            value={type.value}
                            checked={formData.vehicle_type === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div
                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                              formData.vehicle_type === type.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Car
                              className={`w-6 h-6 mx-auto mb-2 ${
                                formData.vehicle_type === type.value
                                  ? 'text-blue-600'
                                  : 'text-gray-400'
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                formData.vehicle_type === type.value
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {type.label}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="origin"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Origin
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="origin"
                          name="origin"
                          value={formData.origin}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Tehran"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Destination
                      </label>
                      <div className="relative">
                        <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="destination"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Isfahan"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200"
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Driver'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDriverModal;
