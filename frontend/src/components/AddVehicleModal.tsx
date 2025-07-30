"use client"; 

import React, { useState } from 'react';
import { X, Car, User, Building, Palette, Weight, Fuel, Clock, Route, Truck, Check } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
}

interface Vehicle {
  id?: number;
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

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAddVehicle }) => {
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>({
    plate_number: '',
    vehicle_type: 'Truck',
    driver: '',
    company: '',
    status: 'Active',
    capacity: '',
    color: 'White',
    fuel_level: '100%',
    last_maintenance: 'Today',
    total_trips: 0,
    efficiency: '8.0 L/100km',
    mileage: '0 km',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onAddVehicle(formData);
    setFormData({
      plate_number: '',
      vehicle_type: 'Truck',
      driver: '',
      company: '',
      status: 'Active',
      capacity: '',
      color: 'White',
      fuel_level: '100%',
      last_maintenance: 'Today',
      total_trips: 0,
      efficiency: '8.0 L/100km',
      mileage: '0 km',
    });
    setIsSubmitting(false);
    setCurrentStep(1);
  };

  const vehicleTypes = [
    { value: 'Truck', label: 'Truck', icon: Truck, color: 'bg-orange-100 text-orange-700' },
    { value: 'Van', label: 'Van', icon: Car, color: 'bg-blue-100 text-blue-700' },
    { value: 'Sedan', label: 'Sedan', icon: Car, color: 'bg-green-100 text-green-700' }
  ];

  const colors = [
    'White', 'Black', 'Blue', 'Red', 'Green', 'Gray', 'Yellow', 'Silver'
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'Inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
    { value: 'Maintenance', label: 'Maintenance', color: 'bg-blue-100 text-blue-700' }
  ];

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
        {/* Modal Container */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative transform transition-all animate-in slide-in-from-bottom-4 duration-300 border border-gray-100 max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Vehicle</h2>
                <p className="text-sm text-gray-500">Monitor and manage your fleet vehicles</p>
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
                <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="text-sm font-medium">Basic Info</span>
                </div>
                <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="text-sm font-medium">Vehicle Details</span>
                </div>
                <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Performance</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="plate_number"
                        name="plate_number"
                        value={formData.plate_number}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="12A345-IR"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {vehicleTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <label key={type.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="vehicle_type"
                              value={type.value}
                              checked={formData.vehicle_type === type.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                              formData.vehicle_type === type.value 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                formData.vehicle_type === type.value ? 'text-orange-600' : 'text-gray-400'
                              }`} />
                              <span className={`text-sm font-medium ${
                                formData.vehicle_type === type.value ? 'text-orange-600' : 'text-gray-600'
                              }`}>
                                {type.label}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="driver"
                          name="driver"
                          value={formData.driver}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Driver's full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Demo Co."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="capacity"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="10t"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 appearance-none bg-white"
                        >
                          {colors.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                    <div className="grid grid-cols-3 gap-3">
                      {statusOptions.map((status) => (
                        <label key={status.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status.value}
                            checked={formData.status === status.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                            formData.status === status.value 
                              ? 'border-orange-500 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <span className={`text-sm font-medium ${
                              formData.status === status.value ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                              {status.label}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fuel_level" className="block text-sm font-medium text-gray-700 mb-2">Fuel Level</label>
                    <div className="relative">
                      <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="fuel_level"
                        name="fuel_level"
                        value={formData.fuel_level}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="85%"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Performance */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="efficiency" className="block text-sm font-medium text-gray-700 mb-2">Fuel Efficiency</label>
                      <div className="relative">
                        <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="efficiency"
                          name="efficiency"
                          value={formData.efficiency}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="8.2 L/100km"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">Total Mileage</label>
                      <div className="relative">
                        <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="mileage"
                          name="mileage"
                          value={formData.mileage}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="45,230 km"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="total_trips" className="block text-sm font-medium text-gray-700 mb-2">Total Trips</label>
                      <input
                        type="number"
                        id="total_trips"
                        name="total_trips"
                        value={formData.total_trips}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="156"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_maintenance" className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="last_maintenance"
                          name="last_maintenance"
                          value={formData.last_maintenance}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="2 weeks ago"
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
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Vehicle'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddVehicleModal;