'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Search,
  Plus,
  Eye,
  User,
  Car,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Fuel,
  Wrench,
  Shield,
  Route,
  Receipt,
  CheckSquare,
} from 'lucide-react';
import AddExpenseModal from '@/components/AddExpenseModal'; // Import the modal component

// تعریف type مناسب برای Expense
interface Expense {
  id: number;
  amount: number;
  description: string;
  payment_method: string;
  date?: string;
  category?: string;
  driver?: string;
  vehicle?: string;
  status?: string;
  receipt_url?: string;
  notes?: string;
}

const FAKE_EXPENSES = [
  {
    id: 1,
    date: '2024-07-01',
    category: 'Fuel',
    amount: 1200000,
    description: 'Fuel for trip',
    driver: 'Amir',
    vehicle: '12A345-IR',
    status: 'Approved',
    receipt_url: '/receipts/1.pdf',
    notes: 'Regular fuel purchase',
    payment_method: 'Company Card',
  },
  {
    id: 2,
    date: '2024-07-02',
    category: 'Maintenance',
    amount: 800000,
    description: 'Oil change',
    driver: 'Sara',
    vehicle: '22B456-IR',
    status: 'Pending',
    receipt_url: '/receipts/2.pdf',
    notes: 'Scheduled maintenance',
    payment_method: 'Cash',
  },
  {
    id: 3,
    date: '2024-07-03',
    category: 'Toll',
    amount: 50000,
    description: 'Highway toll',
    driver: 'Mohammad',
    vehicle: '33C567-IR',
    status: 'Approved',
    receipt_url: '/receipts/3.pdf',
    notes: 'Highway toll payment',
    payment_method: 'Credit Card',
  },
  {
    id: 4,
    date: '2024-07-04',
    category: 'Repair',
    amount: 300000,
    description: 'Brake repair',
    driver: 'Reza',
    vehicle: '44D678-IR',
    status: 'Rejected',
    receipt_url: '/receipts/4.pdf',
    notes: 'Emergency repair needed',
    payment_method: 'Company Card',
  },
  {
    id: 5,
    date: '2024-07-05',
    category: 'Fuel',
    amount: 1100000,
    description: 'Fuel for trip',
    driver: 'Fatemeh',
    vehicle: '55E789-IR',
    status: 'Approved',
    receipt_url: '/receipts/5.pdf',
    notes: 'Long distance trip fuel',
    payment_method: 'Cash',
  },
  {
    id: 6,
    date: '2024-07-06',
    category: 'Insurance',
    amount: 2000000,
    description: 'Annual insurance',
    driver: 'Hossein',
    vehicle: '66F890-IR',
    status: 'Approved',
    receipt_url: '/receipts/6.pdf',
    notes: 'Annual vehicle insurance',
    payment_method: 'Bank Transfer',
  },
  {
    id: 7,
    date: '2024-07-07',
    category: 'Toll',
    amount: 60000,
    description: 'Highway toll',
    driver: 'Maryam',
    vehicle: '77G901-IR',
    status: 'Pending',
    receipt_url: '/receipts/7.pdf',
    notes: 'Return trip toll',
    payment_method: 'Credit Card',
  },
  {
    id: 8,
    date: '2024-07-08',
    category: 'Fuel',
    amount: 1300000,
    description: 'Fuel for trip',
    driver: 'Ali',
    vehicle: '88H012-IR',
    status: 'Approved',
    receipt_url: '/receipts/8.pdf',
    notes: 'Premium fuel purchase',
    payment_method: 'Company Card',
  },
  {
    id: 9,
    date: '2024-07-09',
    category: 'Repair',
    amount: 400000,
    description: 'Engine repair',
    driver: 'Zahra',
    vehicle: '99I123-IR',
    status: 'Pending',
    receipt_url: '/receipts/9.pdf',
    notes: 'Engine diagnostic and repair',
    payment_method: 'Cash',
  },
  {
    id: 10,
    date: '2024-07-10',
    category: 'Maintenance',
    amount: 900000,
    description: 'Tire change',
    driver: 'Alireza',
    vehicle: '10J234-IR',
    status: 'Approved',
    receipt_url: '/receipts/10.pdf',
    notes: 'Scheduled tire replacement',
    payment_method: 'Company Card',
  },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setExpenses([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showExpenses =
    expenses.length >= 10
      ? expenses.slice(0, 10)
      : [...expenses, ...FAKE_EXPENSES.slice(0, 10 - expenses.length)];

  const filteredExpenses = showExpenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === 'all' || expense.status === selectedStatus) &&
      (selectedCategory === 'all' || expense.category === selectedCategory)
  );

  const stats = {
    total: filteredExpenses.length,
    approved: filteredExpenses.filter((e) => e.status === 'Approved').length,
    pending: filteredExpenses.filter((e) => e.status === 'Pending').length,
    rejected: filteredExpenses.filter((e) => e.status === 'Rejected').length,
    totalAmount: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
  };

  const statusConfig = {
    Approved: {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle,
    },
    Pending: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Clock,
    },
    Rejected: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    },
  };

  const categoryConfig = {
    Fuel: { color: 'bg-blue-100 text-blue-700', icon: Fuel },
    Maintenance: { color: 'bg-purple-100 text-purple-700', icon: Wrench },
    Toll: { color: 'bg-orange-100 text-orange-700', icon: Route },
    Repair: { color: 'bg-red-100 text-red-700', icon: Wrench },
    Insurance: { color: 'bg-indigo-100 text-indigo-700', icon: Shield },
  };

  const handleViewExpense = (expenseId: number) => {
    router.push(`/dashboard/expenses/${expenseId}`);
  };

  const handleAddExpense = (newExpense: Expense) => {
    // Add the new expense to the beginning of the list
    setExpenses((prev) => [newExpense, ...prev]);

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      [
        'ID',
        'Date',
        'Category',
        'Amount',
        'Description',
        'Driver',
        'Vehicle',
        'Status',
        'Payment Method',
        'Notes',
      ],
      ...filteredExpenses.map((expense) => [
        expense.id,
        expense.date,
        expense.category,
        expense.amount,
        expense.description,
        expense.driver,
        expense.vehicle,
        expense.status,
        expense.payment_method,
        expense.notes,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl shadow-lg flex items-center gap-2 z-40 animate-slide-in">
            <CheckSquare className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="text-xs lg:text-sm">Expense added successfully!</span>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Expenses Management
                </h1>
                <p className="text-gray-600 text-xs lg:text-base">
                  Track and manage your fleet expenses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-2 lg:px-3 py-2 bg-gray-100 rounded-lg lg:rounded-xl hover:bg-gray-200 transition-all duration-200 text-xs lg:text-sm"
              >
                <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-3 lg:px-4 py-2 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 text-xs lg:text-sm flex-1 lg:flex-none"
              >
                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 mb-4 lg:mb-6">
            {[
              {
                label: 'Total',
                value: stats.total,
                icon: Receipt,
                color: 'from-green-500 to-green-600',
              },
              {
                label: 'Amount',
                value: `${(stats.totalAmount / 1000000).toFixed(1)}M`,
                icon: DollarSign,
                color: 'from-green-700 to-green-700',
              },
              {
                label: 'Approved',
                value: stats.approved,
                icon: CheckCircle,
                color: 'from-green-700 to-green-700',
              },
              {
                label: 'Pending',
                value: stats.pending,
                icon: Clock,
                color: 'from-yellow-500 to-orange-600',
              },
              {
                label: 'Rejected',
                value: stats.rejected,
                icon: XCircle,
                color: 'from-red-500 to-pink-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <div
                      className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${stat.color} rounded-lg lg:rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-base lg:text-lg font-bold text-gray-900">
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
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 lg:px-3 py-2 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 lg:px-3 py-2 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">All Categories</option>
              <option value="Fuel">Fuel</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Toll">Toll</option>
              <option value="Repair">Repair</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
        </div>

        {/* Expenses List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center py-8 lg:py-12">
              <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-base lg:text-lg text-gray-600">
                Loading expenses...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-3 lg:p-6 border-b border-gray-100">
              <h2 className="text-base lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                Expense Records ({filteredExpenses.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredExpenses.map((expense, index) => {
                const StatusIcon =
                  statusConfig[expense.status as keyof typeof statusConfig]
                    ?.icon || CheckCircle;
                const CategoryIcon =
                  categoryConfig[
                    expense.category as keyof typeof categoryConfig
                  ]?.icon || Receipt;

                return (
                  <div
                    key={index}
                    className="p-3 lg:p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewExpense(expense.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
                      {/* Expense Info */}
                      <div className="flex items-start gap-3 lg:gap-6 flex-1">
                        {/* Expense Icon */}
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-100 to-green-100 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                        </div>

                        {/* Main Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-4 mb-2">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                              Expense #{expense.id}
                            </h3>
                            <div className="flex flex-wrap gap-1 lg:gap-2">
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                                  statusConfig[
                                    expense.status as keyof typeof statusConfig
                                  ]?.color
                                }`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {expense.status}
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  categoryConfig[
                                    expense.category as keyof typeof categoryConfig
                                  ]?.color
                                }`}
                              >
                                <CategoryIcon className="w-3 h-3" />
                                {expense.category}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1 lg:gap-2">
                              <Calendar className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">{expense.date}</span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                              <User className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">{expense.driver}</span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                              <Car className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="truncate">{expense.vehicle}</span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                              <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                              <span className="font-semibold text-gray-900 truncate">
                                {expense.amount.toLocaleString()} Toman
                              </span>
                            </div>
                          </div>

                          {/* Mobile Amount Display */}
                          <div className="lg:hidden flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                {expense.amount.toLocaleString()}
                              </div>
                              <div>Amount</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                {expense.payment_method}
                              </div>
                              <div>Payment</div>
                            </div>
                          </div>

                          {/* Description and Notes */}
                          <div className="text-xs lg:text-sm text-gray-600 mt-2">
                            <div className="font-medium text-gray-900 mb-1 truncate">
                              {expense.description}
                            </div>
                            {expense.notes && (
                              <div className="text-gray-500 italic truncate">
                                {expense.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:gap-3 lg:ml-6">
                        {expense.receipt_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(expense.receipt_url, '_blank');
                            }}
                            className="flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-xs lg:text-sm"
                          >
                            <Receipt className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewExpense(expense.id);
                          }}
                          className="flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-2 bg-green-100 text-green-700 rounded-lg hover:bg-orange-200 transition-all duration-200 text-xs lg:text-sm"
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
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 lg:py-12">
                <DollarSign className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                  No Expenses Found
                </h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 mx-auto text-sm"
                >
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                  Add New Expense
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddExpense}
        />
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
