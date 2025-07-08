"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-700 rounded-full animate-spin mb-4" />
        <span className="text-xl font-bold text-blue-800 animate-pulse">Loading...</span>
      </div>
    </div>
  );
} 