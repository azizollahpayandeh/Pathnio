'use client';
import { useState } from 'react';
import {
  X,
  DollarSign,
  FileText,
  User,
  Car,
  Calendar,
  Upload,
  CreditCard,
  Tag,
  MessageSquare,
  Save,
  Fuel,
  Wrench,
  Route,
  Shield,
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: any) => void;
}

interface ExpenseForm {
  amount: string;
  description: string;
  category: string;
  driver: string;
  vehicle: string;
  date: string;
  paymentMethod: string;
  notes: string;
  receipt: File | null;
}

const CATEGORIES = [
  { value: 'Fuel', label: 'Fuel', icon: Fuel, color: 'text-blue-600' },
  { value: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'text-purple-600' },
  { value: 'Toll', label: 'Toll', icon: Route, color: 'text-orange-600' },
  { value: 'Repair', label: 'Repair', icon: Wrench, color: 'text-red-600' },
  { value: 'Insurance', label: 'Insurance', icon: Shield, color: 'text-indigo-600' },
];

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Company Card', label: 'Company Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
];

const DRIVERS = [
  'Amir', 'Sara', 'Mohammad', 'Reza', 'Fatemeh', 'Hossein', 'Maryam', 'Ali', 'Zahra', 'Alireza'
];

const VEHICLES = [
  '12A345-IR', '22B456-IR', '33C567-IR', '44D678-IR', '55E789-IR',
  '66F890-IR', '77G901-IR', '88H012-IR', '99I123-IR', '10J234-IR'
];

export default function AddExpenseModal({ isOpen, onClose, onSubmit }: AddExpenseModalProps) {
  const [form, setForm] = useState<ExpenseForm>({
    amount: '',
    description: '',
    category: '',
    driver: '',
    vehicle: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: '',
    receipt: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ExpenseForm>>({});

  const handleInputChange = (field: keyof ExpenseForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, receipt: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ExpenseForm> = {};

    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    if (!form.driver) {
      newErrors.driver = 'Driver is required';
    }
    if (!form.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }
    if (!form.date) {
      newErrors.date = 'Date is required';
    }
    if (!form.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newExpense = {
        id: Date.now(),
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category,
        driver: form.driver,
        vehicle: form.vehicle,
        date: form.date,
        payment_method: form.paymentMethod,
        notes: form.notes,
        status: 'Pending',
        receipt_url: form.receipt ? '/receipts/new.pdf' : null,
      };

      onSubmit(newExpense);
      
      // Reset form
      setForm({
        amount: '',
        description: '',
        category: '',
        driver: '',
        vehicle: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        notes: '',
        receipt: null,
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Add New Expense</h2>
                <p className="text-green-100">Create a new expense record</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Amount and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount (Toman) *
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter amount..."
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    );
                  })}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Description *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Enter description..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Driver and Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Driver *
                </label>
                <select
                  value={form.driver}
                  onChange={(e) => handleInputChange('driver', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.driver ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select driver...</option>
                  {DRIVERS.map((driver) => (
                    <option key={driver} value={driver}>
                      {driver}
                    </option>
                  ))}
                </select>
                {errors.driver && (
                  <p className="text-red-500 text-sm mt-1">{errors.driver}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle *
                </label>
                <select
                  value={form.vehicle}
                  onChange={(e) => handleInputChange('vehicle', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.vehicle ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select vehicle...</option>
                  {VEHICLES.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
                {errors.vehicle && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>
                )}
              </div>
            </div>

            {/* Date and Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Payment Method *
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.paymentMethod ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select payment method...</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Receipt (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {form.receipt ? form.receipt.name : 'Click to upload receipt'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports: Images, PDF (Max 5MB)
                  </p>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Notes (Optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}