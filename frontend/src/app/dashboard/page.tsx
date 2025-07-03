"use client";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("../../components/LiveMapWidget"), { ssr: false });
const Chart = dynamic(() => import("../../components/ChartWidget"), { ssr: false });

export default function Dashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Widgets */}
        <Widget title="Active Drivers" value="12" icon="🟢" />
        <Widget title="Inactive Drivers" value="3" icon="🔴" />
        <Widget title="Online Vehicles" value="8" icon="🚗" />
        <Widget title="Offline Vehicles" value="2" icon="🚙" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-4 text-blue-700">Live Vehicle Map</h2>
          <LiveMap />
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold mb-4 text-blue-700">Trips This Week</h2>
            <Chart />
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold mb-2 text-blue-700">Today's Expenses</h2>
            <div className="text-2xl font-bold text-green-600">1,200,000 Toman</div>
            <h2 className="font-bold mb-2 mt-4 text-blue-700">This Month</h2>
            <div className="text-xl font-bold text-blue-600">8,500,000 Toman</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow flex flex-col items-center justify-center p-6 gap-2">
      <span className="text-3xl">{icon}</span>
      <span className="text-lg font-bold text-blue-700">{title}</span>
      <span className="text-2xl font-extrabold">{value}</span>
    </div>
  );
} 