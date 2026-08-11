"use client";
import { useMemo } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { BarChart3, TrendingUp, TrendingDown, Percent, Download } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { useTrips, useExpenses, useVehicles } from "@/lib/api-data";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

const currency = (n: number) => "€" + Math.round(n).toLocaleString();
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReportsPage() {
  const { data: trips } = useTrips();
  const { data: expenses } = useExpenses();
  const { data: vehicles } = useVehicles();

  const totals = useMemo(() => {
    const revenue = trips.filter((t) => t.status !== "CANCELLED").reduce((s, t) => s + t.revenue, 0);
    const cost = expenses.reduce((s, e) => s + e.amount, 0);
    const profit = revenue - cost;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    return { revenue, cost, profit, margin };
  }, [trips, expenses]);

  // Revenue vs expenses over the last 6 months
  const timeSeries = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabels[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}` });
    }
    const rev = new Array(6).fill(0);
    const exp = new Array(6).fill(0);
    const idx = (dt: string) => {
      const d = new Date(dt);
      return buckets.findIndex((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
    };
    trips.forEach((t) => {
      const i = idx(t.start_time);
      if (i >= 0 && t.status !== "CANCELLED") rev[i] += t.revenue;
    });
    expenses.forEach((e) => {
      const i = idx(e.date);
      if (i >= 0) exp[i] += e.amount;
    });
    // Real data only — the chart reflects actual trips/expenses (flat when none).
    return { labels: buckets.map((b) => b.label), rev, exp };
  }, [trips, expenses]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return { labels: [...map.keys()], values: [...map.values()] };
  }, [expenses]);

  const topVehicles = useMemo(() => {
    const map = new Map<string, number>();
    trips.forEach((t) => {
      if (t.plate_number) map.set(t.plate_number, (map.get(t.plate_number) || 0) + t.revenue);
    });
    let sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length === 0) sorted = vehicles.slice(0, 6).map((v) => [v.plate_number, 0] as [string, number]);
    return { labels: sorted.map((s) => s[0]), values: sorted.map((s) => s[1]) };
  }, [trips, vehicles]);

  const chartFont = { family: "inherit" };
  const gridColor = "rgba(148,163,184,0.15)";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={BarChart3}
        title="Reports & Analytics"
        subtitle="Financial and operational insights"
        gradient="from-violet-500 to-purple-600"
        actions={
          <button onClick={() => window.print()} className="btn btn-ghost">
            <Download className="w-4 h-4" /> Export
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={TrendingUp} label="Total Revenue" value={currency(totals.revenue)} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={TrendingDown} label="Total Costs" value={currency(totals.cost)} gradient="from-rose-500 to-red-600" />
        <StatCard icon={BarChart3} label="Net Profit" value={currency(totals.profit)} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={Percent} label="Profit Margin" value={`${totals.margin.toFixed(1)}%`} gradient="from-purple-500 to-fuchsia-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-slate-800 mb-4">Revenue vs Expenses</h2>
          <div className="h-72">
            <Line
              data={{
                labels: timeSeries.labels,
                datasets: [
                  {
                    label: "Revenue", data: timeSeries.rev, borderColor: "#7c3aed",
                    backgroundColor: "rgba(124, 58, 237,0.12)", fill: true, tension: 0.4, pointRadius: 3,
                  },
                  {
                    label: "Expenses", data: timeSeries.exp, borderColor: "#f43f5e",
                    backgroundColor: "rgba(244,63,94,0.10)", fill: true, tension: 0.4, pointRadius: 3,
                  },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { font: chartFont, usePointStyle: true } } },
                scales: {
                  x: { grid: { color: gridColor }, ticks: { font: chartFont } },
                  y: { grid: { color: gridColor }, ticks: { font: chartFont } },
                },
              }}
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-4">Expenses by Category</h2>
          <div className="h-72 flex items-center justify-center">
            <Doughnut
              data={{
                labels: byCategory.labels,
                datasets: [{
                  data: byCategory.values,
                  backgroundColor: ["#8b5cf6", "#f97316", "#a855f7", "#14b8a6", "#6366f1", "#94a3b8"],
                  borderWidth: 0,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false, cutout: "62%",
                plugins: { legend: { position: "bottom", labels: { font: chartFont, usePointStyle: true, padding: 14 } } },
              }}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-4">Top Vehicles by Revenue</h2>
        <div className="h-72">
          <Bar
            data={{
              labels: topVehicles.labels,
              datasets: [{
                label: "Revenue", data: topVehicles.values,
                backgroundColor: "rgba(124, 58, 237,0.85)", borderRadius: 8, maxBarThickness: 42,
              }],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { font: chartFont } },
                y: { grid: { color: gridColor }, ticks: { font: chartFont } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
