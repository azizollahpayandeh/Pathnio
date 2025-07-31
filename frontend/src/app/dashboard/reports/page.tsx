"use client";
import { useEffect, useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  User,
<<<<<<< HEAD
  Calendar,
=======
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
);

const SUMMARY = [
  { 
    label: "Total Trips", 
    value: "1,247", 
    change: "+12.5%", 
    trend: "up",
    icon: Car,
    color: "from-blue-500 to-indigo-600"
  },
  { 
    label: "Total Revenue", 
    value: "₺2.4M", 
    change: "+8.3%", 
    trend: "up",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600"
  },
  { 
    label: "Active Drivers", 
    value: "24", 
    change: "+2", 
    trend: "up",
    icon: User,
    color: "from-purple-500 to-violet-600"
  },
  { 
    label: "Active Vehicles", 
    value: "18", 
    change: "-1", 
    trend: "down",
    icon: Car,
    color: "from-orange-500 to-amber-600"
  },
];

const EXPENSES_DATA = {
  labels: ["Fuel", "Maintenance", "Toll", "Repair", "Insurance", "Other"],
  datasets: [
    {
      label: "Expenses (₺)",
      data: [4500000, 2500000, 800000, 1200000, 2000000, 500000],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(107, 114, 128, 0.8)",
      ],
      borderColor: [
        "rgba(59, 130, 246, 1)",
        "rgba(168, 85, 247, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(34, 197, 94, 1)",
        "rgba(107, 114, 128, 1)",
      ],
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
};

const TRIPS_DATA = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Trips Completed",
      data: [45, 52, 38, 61, 48, 35, 42],
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    },
    {
      label: "Trips Planned",
      data: [50, 55, 42, 65, 52, 40, 48],
      backgroundColor: "rgba(168, 85, 247, 0.6)",
      borderColor: "rgba(168, 85, 247, 1)",
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
};

const REVENUE_DATA = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Monthly Revenue (₺)",
      data: [180000, 220000, 195000, 280000, 320000, 290000, 350000, 380000, 420000, 450000, 480000, 520000],
      borderColor: "rgba(34, 197, 94, 1)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "rgba(34, 197, 94, 1)",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
};

const EFFICIENCY_DATA = {
  labels: ["Fuel Efficiency", "Route Optimization", "Driver Performance", "Vehicle Maintenance", "Time Management"],
  datasets: [
    {
      label: "Efficiency Score (%)",
      data: [85, 92, 78, 88, 95],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
      borderColor: [
        "rgba(59, 130, 246, 1)",
        "rgba(34, 197, 94, 1)",
        "rgba(168, 85, 247, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)",
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">Reports & Analytics</h1>
              <p className="text-gray-600 text-sm lg:text-lg">Comprehensive insights into your fleet performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-xl border border-white/20 text-center">
            <div className="text-blue-600 animate-pulse text-lg lg:text-xl">Loading reports...</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {SUMMARY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 lg:p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        item.trend === 'up' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.change}
                      </div>
                    </div>
                    <div className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                    <div className="text-xs lg:text-sm text-gray-600">{item.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Expenses Breakdown */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-4">
                  <div>
                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Expenses Breakdown</h3>
                    <p className="text-gray-600 text-sm lg:text-base">Distribution of operational costs</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <PieChart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="h-60 lg:h-80 w-full">
                  <Doughnut
                    data={EXPENSES_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '600',
=======
                              weight: 'bold',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                          },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                          borderWidth: 1,
                          cornerRadius: 12,
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ₺${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Trips per Day */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Trip Analysis</h3>
                    <p className="text-gray-600">Completed vs planned trips</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="h-80 w-full">
                  <Bar
                    data={TRIPS_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '600',
=======
                              weight: 'bold',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                          },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                          borderWidth: 1,
                          cornerRadius: 12,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
<<<<<<< HEAD
                            drawBorder: false,
=======
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                          },
                          ticks: {
                            color: '#6b7280',
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '500',
=======
                              weight: 'normal',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#6b7280',
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '500',
=======
                              weight: 'normal',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trends */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Trends</h3>
                    <p className="text-gray-600">Monthly revenue performance</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="h-80 w-full">
                  <Line
                    data={REVENUE_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'rgba(34, 197, 94, 0.5)',
                          borderWidth: 1,
                          cornerRadius: 12,
                          callbacks: {
                            label: function(context) {
                              return `Revenue: ₺${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
<<<<<<< HEAD
                            drawBorder: false,
=======
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                          },
                          ticks: {
                            color: '#6b7280',
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '500',
=======
                              weight: 'normal',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                            callback: function(value) {
                              return '₺' + (value as number / 1000) + 'K';
                            }
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#6b7280',
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '500',
=======
                              weight: 'normal',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                          },
                        },
                      },
                      elements: {
                        point: {
                          hoverRadius: 8,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Efficiency Metrics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Efficiency Metrics</h3>
                    <p className="text-gray-600">Performance across key areas</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="h-80 w-full">
                  <Bar
                    data={EFFICIENCY_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y' as const,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                          borderWidth: 1,
                          cornerRadius: 12,
                          callbacks: {
                            label: function(context) {
                              return `Efficiency: ${context.parsed.x}%`;
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
<<<<<<< HEAD
                            drawBorder: false,
=======
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                          },
                          ticks: {
                            color: '#6b7280',
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '500',
=======
                              weight: 'normal',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                            stepSize: 20,
                          },
                        },
                        y: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#6b7280',
                            font: {
                              size: 12,
<<<<<<< HEAD
                              weight: '500',
=======
                              weight: 'normal',
>>>>>>> 66d33a4f74ca751e334222b05c8975696d814720
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 