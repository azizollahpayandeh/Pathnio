"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign, User, Truck, FileText, CreditCard, Receipt, AlertCircle, CheckCircle, Clock, Tag, MapPin } from "lucide-react";

// Static expense data for demonstration
const EXPENSE_DETAILS = {
  1: {
    id: 1,
    date: "2024-07-01",
    category: "Fuel",
    amount: 1200000,
    description: "Fuel for trip from Tehran to Isfahan",
    driver: "Amir",
    vehicle: "12A345-IR",
    status: "Approved",
    approved_by: "Manager Ali",
    approved_date: "2024-07-02",
    receipt_number: "RCP-2024-001",
    payment_method: "Company Card",
    location: "Tehran Gas Station",
    fuel_liters: 150,
    fuel_price_per_liter: 8000,
    trip_id: "TRP-001",
    notes: "Standard fuel purchase for scheduled trip. All documentation submitted.",
    attachments: ["receipt.jpg", "invoice.pdf"],
    expense_type: "Operational",
    tax_amount: 120000,
    total_with_tax: 1320000,
    reimbursement_status: "Paid",
    payment_date: "2024-07-03",
    bank_transaction_id: "TXN-2024-789",
    category_details: {
      fuel_type: "Diesel",
      station_name: "Tehran Central Station",
      pump_number: "P-05"
    }
  },
  2: {
    id: 2,
    date: "2024-07-02",
    category: "Maintenance",
    amount: 800000,
    description: "Oil change and filter replacement",
    driver: "Sara",
    vehicle: "22B456-IR",
    status: "Pending",
    approved_by: null,
    approved_date: null,
    receipt_number: "RCP-2024-002",
    payment_method: "Cash",
    location: "Tehran Auto Service",
    service_type: "Regular Maintenance",
    parts_replaced: ["Oil Filter", "Air Filter", "Oil"],
    mechanic_name: "Hassan Mechanic",
    service_center: "Tehran Auto Service Center",
    trip_id: null,
    notes: "Regular maintenance scheduled. Waiting for approval from management.",
    attachments: ["service_invoice.pdf", "parts_list.pdf"],
    expense_type: "Maintenance",
    tax_amount: 80000,
    total_with_tax: 880000,
    reimbursement_status: "Pending",
    payment_date: null,
    bank_transaction_id: null,
    category_details: {
      service_center_rating: 4.5,
      warranty_months: 6,
      next_service_date: "2024-10-02"
    }
  },
  3: {
    id: 3,
    date: "2024-07-03",
    category: "Toll",
    amount: 50000,
    description: "Highway toll for Tehran-Isfahan route",
    driver: "Mohammad",
    vehicle: "33C567-IR",
    status: "Approved",
    approved_by: "Manager Ali",
    approved_date: "2024-07-03",
    receipt_number: "RCP-2024-003",
    payment_method: "Cash",
    location: "Tehran-Isfahan Highway",
    toll_booth: "Booth 12",
    route: "Tehran → Isfahan",
    distance: "450 km",
    trip_id: "TRP-003",
    notes: "Standard highway toll payment. Receipt obtained.",
    attachments: ["toll_receipt.jpg"],
    expense_type: "Operational",
    tax_amount: 0,
    total_with_tax: 50000,
    reimbursement_status: "Paid",
    payment_date: "2024-07-03",
    bank_transaction_id: null,
    category_details: {
      toll_type: "Highway",
      vehicle_type: "Commercial Truck",
      discount_applied: "None"
    }
  },
  4: {
    id: 4,
    date: "2024-07-04",
    category: "Repair",
    amount: 300000,
    description: "Brake system repair and replacement",
    driver: "Reza",
    vehicle: "44D678-IR",
    status: "Rejected",
    approved_by: null,
    approved_date: null,
    receipt_number: "RCP-2024-004",
    payment_method: "Company Card",
    location: "Emergency Repair Center",
    repair_type: "Emergency Repair",
    parts_replaced: ["Brake Pads", "Brake Fluid"],
    mechanic_name: "Emergency Mechanic",
    service_center: "Emergency Auto Service",
    trip_id: "TRP-004",
    notes: "Emergency brake repair required due to safety concerns. Rejected due to lack of pre-approval.",
    attachments: ["repair_invoice.pdf", "safety_report.pdf"],
    expense_type: "Emergency",
    tax_amount: 30000,
    total_with_tax: 330000,
    reimbursement_status: "Rejected",
    payment_date: null,
    bank_transaction_id: null,
    category_details: {
      emergency_type: "Safety Critical",
      repair_urgency: "High",
      safety_impact: "Critical"
    }
  },
  5: {
    id: 5,
    date: "2024-07-05",
    category: "Fuel",
    amount: 1100000,
    description: "Fuel for Shiraz-Tabriz trip",
    driver: "Fatemeh",
    vehicle: "55E789-IR",
    status: "Approved",
    approved_by: "Manager Ali",
    approved_date: "2024-07-06",
    receipt_number: "RCP-2024-005",
    payment_method: "Company Card",
    location: "Shiraz Gas Station",
    fuel_liters: 137.5,
    fuel_price_per_liter: 8000,
    trip_id: "TRP-005",
    notes: "Fuel purchase for long-distance trip. All documentation complete.",
    attachments: ["fuel_receipt.jpg", "trip_log.pdf"],
    expense_type: "Operational",
    tax_amount: 110000,
    total_with_tax: 1210000,
    reimbursement_status: "Paid",
    payment_date: "2024-07-07",
    bank_transaction_id: "TXN-2024-790",
    category_details: {
      fuel_type: "Diesel",
      station_name: "Shiraz Central Station",
      pump_number: "P-03"
    }
  }
};

// Define the complete Expense interface to match the data structure
interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  driver: string;
  vehicle: string;
  status: string;
  approved_by: string | null;
  approved_date: string | null;
  receipt_number: string;
  payment_method: string;
  location: string;
  trip_id: string | null;
  notes: string;
  attachments: string[];
  expense_type: string;
  tax_amount: number;
  total_with_tax: number;
  reimbursement_status: string;
  payment_date: string | null;
  bank_transaction_id: string | null;
  category_details: any;
}

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expenseId = parseInt(params.id as string);
    const expenseData = EXPENSE_DETAILS[expenseId as keyof typeof EXPENSE_DETAILS];
    
    if (expenseData) {
      setExpense(expenseData);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 text-lg font-semibold">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Expense Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/expenses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Rejected': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return "0 Toman";
    }
    return amount.toLocaleString() + " Toman";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push('/dashboard/expenses')}
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Expenses
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-700 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Expense #{expense.id}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-2 rounded-full border-2 font-semibold flex items-center gap-2 ${getStatusColor(expense.status)}`}>
                  {getStatusIcon(expense.status)}
                  {expense.status}
                </span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(expense.amount)}</div>
                <div className="text-sm text-gray-600">Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{expense.category}</div>
                <div className="text-sm text-gray-600">Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{expense.driver}</div>
                <div className="text-sm text-gray-600">Driver</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Expense Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6" />
                Expense Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Category</div>
                      <div className="text-lg font-bold text-blue-600">{expense.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Amount</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(expense.amount)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Receipt Number</div>
                      <div className="text-lg font-bold text-blue-600">{expense.receipt_number}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Driver</div>
                      <div className="text-lg font-bold text-blue-600">{expense.driver}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Vehicle</div>
                      <div className="text-lg font-bold text-blue-600">{expense.vehicle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Payment Method</div>
                      <div className="text-lg font-bold text-blue-600">{expense.payment_method}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="font-semibold text-blue-700 mb-2">Description:</div>
                <div className="text-gray-700">{expense.description}</div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                Financial Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(expense.amount)}</div>
                  <div className="text-sm text-gray-600">Base Amount</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(expense.tax_amount)}</div>
                  <div className="text-sm text-gray-600">Tax Amount</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(expense.total_with_tax)}</div>
                  <div className="text-sm text-gray-600">Total with Tax</div>
                </div>
              </div>
            </div>

            {/* Location & Trip Info */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                Location & Trip Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Location</div>
                      <div className="text-lg font-bold text-blue-600">{expense.location}</div>
                    </div>
                  </div>
                  {expense.trip_id && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">🚛</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Trip ID</div>
                        <div className="text-lg font-bold text-blue-600">{expense.trip_id}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-700">Date</div>
                      <div className="text-lg font-bold text-blue-600">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📋</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Expense Type</div>
                      <div className="text-lg font-bold text-blue-600">{expense.expense_type}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status & Approval */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                {getStatusIcon(expense.status)}
                Status & Approval
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </span>
                </div>
                {expense.approved_by && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approved By</span>
                    <span className="font-bold text-blue-600">{expense.approved_by}</span>
                  </div>
                )}
                {expense.approved_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approved Date</span>
                    <span className="font-bold text-green-600">{new Date(expense.approved_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reimbursement</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    expense.reimbursement_status === 'Paid' ? 'bg-green-100 text-green-800' : 
                    expense.reimbursement_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {expense.reimbursement_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-bold text-blue-600">{expense.payment_method}</span>
                </div>
                {expense.payment_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Date</span>
                    <span className="font-bold text-green-600">{new Date(expense.payment_date).toLocaleDateString()}</span>
                  </div>
                )}
                {expense.bank_transaction_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-bold text-purple-600">{expense.bank_transaction_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Specific Details */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4">Category Details</h3>
              <div className="space-y-4">
                {expense.category === 'Fuel' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fuel Type</span>
                      <span className="font-bold text-blue-600">{expense.category_details.fuel_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Liters</span>
                      <span className="font-bold text-green-600">{expense.category_details.fuel_liters} L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price per Liter</span>
                      <span className="font-bold text-purple-600">{formatCurrency(expense.category_details.fuel_price_per_liter)}</span>
                    </div>
                  </>
                )}
                {expense.category === 'Maintenance' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Type</span>
                      <span className="font-bold text-blue-600">{expense.category_details.service_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Warranty</span>
                      <span className="font-bold text-green-600">{expense.category_details.warranty_months} months</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Next Service</span>
                      <span className="font-bold text-purple-600">{expense.category_details.next_service_date}</span>
                    </div>
                  </>
                )}
                {expense.category === 'Toll' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Toll Type</span>
                      <span className="font-bold text-blue-600">{expense.category_details.toll_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Vehicle Type</span>
                      <span className="font-bold text-green-600">{expense.category_details.vehicle_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-bold text-purple-600">{expense.category_details.discount_applied}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-fade-in" style={{animationDelay: '0.7s'}}>
              <h3 className="text-xl font-bold text-blue-700 mb-4">Attachments</h3>
              <div className="space-y-3">
                {expense.attachments.map((attachment: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {attachment.endsWith('.pdf') ? '📄' : '📷'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Notes</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <p className="text-gray-700 leading-relaxed">{expense.notes}</p>
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