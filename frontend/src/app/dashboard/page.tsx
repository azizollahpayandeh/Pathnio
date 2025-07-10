"use client";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("../../components/LiveMapWidget"), { ssr: false });
const Chart = dynamic(() => import("../../components/ChartWidget"), { ssr: false });

export default function Dashboard() {
  return (
    <div className="animate-fadein">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
        {/* Widgets */}
        <Widget title="Active Drivers" value="12" icon="🟢" color="from-green-400 to-blue-500" />
        <Widget title="Inactive Drivers" value="3" icon="🔴" color="from-red-400 to-pink-500" />
        <Widget title="Online Vehicles" value="8" icon="🚗" color="from-blue-400 to-purple-500" />
        <Widget title="Offline Vehicles" value="2" icon="🚙" color="from-gray-400 to-blue-200" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="col-span-2 bg-white/80 rounded-2xl shadow-2xl p-8 border border-blue-100 hover:shadow-blue-200 transition-shadow duration-300">
          <h2 className="font-extrabold mb-6 text-blue-700 text-xl flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Live Vehicle Map
          </h2>
          <LiveMap />
        </div>
        <div className="flex flex-col gap-8">
          <div className="bg-white/80 rounded-2xl shadow-2xl p-8 border border-blue-100 hover:shadow-blue-200 transition-shadow duration-300">
            <h2 className="font-extrabold mb-6 text-blue-700 text-xl flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Trips This Week
            </h2>
            <Chart />
          </div>
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 border border-blue-100 flex flex-col gap-4">
            <h2 className="font-bold mb-2 text-blue-700">Today's Expenses</h2>
            <div className="text-3xl font-extrabold text-green-600 drop-shadow-lg animate-fadein-slow">1,200,000 Toman</div>
            <h2 className="font-bold mb-2 mt-4 text-blue-700">This Month</h2>
            <div className="text-2xl font-bold text-blue-600 drop-shadow-lg animate-fadein-slow">8,500,000 Toman</div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadein {
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fadein-slow {
          animation: fadein 1.5s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
}

function Widget({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`relative bg-gradient-to-br ${color} rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 gap-2 border border-blue-100 hover:scale-105 hover:shadow-2xl transition-transform duration-300 animate-fadein`}>
      <span className="text-4xl drop-shadow-lg">{icon}</span>
      <span className="text-lg font-bold text-blue-900 drop-shadow">{title}</span>
      <span className="text-3xl font-extrabold text-white drop-shadow-lg">{value}</span>
      <div className="absolute -bottom-2 right-4 w-8 h-8 bg-white/30 rounded-full blur-2xl opacity-60"></div>
    </div>
  );
} 