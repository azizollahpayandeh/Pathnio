"use client";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("../../../components/LiveMapWidget"), { ssr: false });

export default function LiveMapPage() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h1 className="font-bold text-2xl mb-4 text-blue-700">Live Vehicle Map</h1>
      <LiveMap />
    </div>
  );
} 