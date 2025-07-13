"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FAKE_EXPENSES = [
  { id: 1, date: "2024-07-01", category: "Fuel", amount: 1200000, description: "Fuel for trip", driver: "Amir", vehicle: "12A345-IR", status: "Approved" },
  { id: 2, date: "2024-07-02", category: "Maintenance", amount: 800000, description: "Oil change", driver: "Sara", vehicle: "22B456-IR", status: "Pending" },
  { id: 3, date: "2024-07-03", category: "Toll", amount: 50000, description: "Highway toll", driver: "Mohammad", vehicle: "33C567-IR", status: "Approved" },
  { id: 4, date: "2024-07-04", category: "Repair", amount: 300000, description: "Brake repair", driver: "Reza", vehicle: "44D678-IR", status: "Rejected" },
  { id: 5, date: "2024-07-05", category: "Fuel", amount: 1100000, description: "Fuel for trip", driver: "Fatemeh", vehicle: "55E789-IR", status: "Approved" },
  { id: 6, date: "2024-07-06", category: "Insurance", amount: 2000000, description: "Annual insurance", driver: "Hossein", vehicle: "66F890-IR", status: "Approved" },
  { id: 7, date: "2024-07-07", category: "Toll", amount: 60000, description: "Highway toll", driver: "Maryam", vehicle: "77G901-IR", status: "Pending" },
  { id: 8, date: "2024-07-08", category: "Fuel", amount: 1300000, description: "Fuel for trip", driver: "Ali", vehicle: "88H012-IR", status: "Approved" },
  { id: 9, date: "2024-07-09", category: "Repair", amount: 400000, description: "Engine repair", driver: "Zahra", vehicle: "99I123-IR", status: "Pending" },
  { id: 10, date: "2024-07-10", category: "Maintenance", amount: 900000, description: "Tire change", driver: "Alireza", vehicle: "10J234-IR", status: "Approved" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // در آینده: دریافت داده واقعی از API
  useEffect(() => {
    setLoading(false);
    setExpenses([]); // اگر داده واقعی داشتی اینجا set کن
  }, []);

  const showExpenses = expenses.length >= 10 ? expenses.slice(0, 10) : [...expenses, ...FAKE_EXPENSES.slice(0, 10 - expenses.length)];

  const handleViewExpense = (expenseId: number) => {
    router.push(`/dashboard/expenses/${expenseId}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-4 lg:p-6 max-w-[1100px] 2xl:max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <h1 className="font-extrabold text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 lg:mb-6 text-blue-700 flex-shrink-0">Expenses Management</h1>
        {loading ? (
          <div className="text-blue-400 animate-pulse text-lg">Loading expenses...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto 2xl:overflow-x-hidden">
              <div className="min-w-full 2xl:w-full">
                <table className="w-full bg-white rounded-xl shadow-md text-xs sm:text-sm md:text-base lg:text-base 2xl:text-[20px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left rounded-tl-xl whitespace-nowrap text-xs">
                        <div className="flex flex-col">
                          <span>Expense</span>
                          <span>ID</span>
                        </div>
                      </th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Date</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Category</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Amount</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Description</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Driver</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Vehicle</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left whitespace-nowrap">Status</th>
                      <th className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 text-left rounded-tr-xl whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showExpenses.map((e, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer">
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] font-bold text-blue-900 whitespace-nowrap text-xs">{e.id}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] whitespace-nowrap">{e.date}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] whitespace-nowrap">{e.category}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] whitespace-nowrap">{e.amount.toLocaleString()} Toman</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] max-w-xs truncate">{e.description}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] whitespace-nowrap">{e.driver}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 2xl:text-[19px] 2xl:py-[17px] whitespace-nowrap">{e.vehicle}</td>
                        <td className={`py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 font-semibold whitespace-nowrap ${e.status === 'Approved' ? 'text-green-600' : e.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'}`}>{e.status}</td>
                        <td className="py-1.5 md:py-2 lg:py-2 px-1.5 md:px-2 lg:px-3 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewExpense(e.id)}
                            className="bg-blue-100 text-blue-700 px-1 md:px-1.5 lg:px-2 py-0.5 md:py-1 rounded-lg shadow hover:bg-blue-200 transition text-xs 2xl:text-[17px] font-semibold cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 