"use client";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const SUMMARY = [
  { label: "Total Trips", value: 120 },
  { label: "Total Expenses", value: "12,500,000 Toman" },
  { label: "Active Drivers", value: 8 },
  { label: "Active Vehicles", value: 6 },
];

const PIE_DATA = {
  labels: ["Fuel", "Maintenance", "Toll", "Repair", "Insurance"],
  datasets: [
    {
      label: "Expenses",
      data: [4500000, 2500000, 800000, 1200000, 2000000],
      backgroundColor: [
        "#2563eb",
        "#818cf8",
        "#fbbf24",
        "#f87171",
        "#34d399",
      ],
      borderWidth: 1,
    },
  ],
};

const BAR_DATA = {
  labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      label: "Trips per Day",
      data: [12, 19, 8, 15, 10, 7, 14],
      backgroundColor: "#2563eb",
      borderRadius: 8,
    },
  ],
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  // حذف setError اگر استفاده نشده

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
        <h1 className="font-extrabold text-2xl md:text-3xl mb-4 md:mb-6 lg:mb-8 text-blue-700">Reports & Analytics</h1>
        {loading ? (
          <div className="text-blue-400 animate-pulse text-lg">Loading reports...</div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
              {/* Summary Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {SUMMARY.map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow p-4 md:p-6 flex flex-col items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm md:text-base lg:text-lg mb-2 text-center">{item.label}</span>
                    <span className="text-lg md:text-xl lg:text-2xl font-extrabold text-blue-900 text-center">{item.value}</span>
                  </div>
                ))}
              </div>
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex flex-col items-center">
                  <h2 className="font-bold text-blue-700 mb-4 text-sm md:text-base lg:text-lg">Expenses Breakdown</h2>
                  <div className="w-full max-w-xs">
                    <Pie data={PIE_DATA} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex flex-col items-center">
                  <h2 className="font-bold text-blue-700 mb-4 text-sm md:text-base lg:text-lg">Trips per Day</h2>
                  <div className="w-full max-w-xs">
                    <Bar data={BAR_DATA} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 