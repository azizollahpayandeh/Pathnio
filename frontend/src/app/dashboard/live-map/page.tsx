"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const LiveMap = dynamic(() => import("../../../components/LiveMapWidget"), { ssr: false });

export default function LiveMapPage() {
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <>
      {!fullscreen && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-extrabold text-3xl text-blue-700">Live Vehicle Map</h1>
            <button onClick={toggleFullscreen} className="ml-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition text-base">
              Fullscreen
            </button>
          </div>
          <div>
            <LiveMap fullscreen={false} />
          </div>
        </div>
      )}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <div className="absolute top-4 right-4 z-[10000]">
            <button onClick={toggleFullscreen} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition text-base">
              Exit Fullscreen
            </button>
          </div>
          <div className="w-full h-full">
            <LiveMap fullscreen={true} />
          </div>
        </div>
      )}
    </>
  );
} 