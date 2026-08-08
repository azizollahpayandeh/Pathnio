"use client";
import Link from "next/link";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-100 to-violet-300 text-violet-900 px-4 py-20">
      <div className="flex flex-col items-center gap-4 bg-white/80 rounded-3xl shadow-2xl p-10">
        <Frown className="w-16 h-16 text-violet-500 mb-2 animate-bounce" />
        <h1 className="text-6xl font-extrabold mb-2 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found!</h2>
        <p className="text-violet-700 mb-6 text-center max-w-xs">Sorry, the page you are looking for does not exist or may have been removed.</p>
        <Link href="/" className="px-6 py-3 bg-violet-700 text-white rounded-xl font-semibold shadow hover:bg-violet-800 transition">Back to Home</Link>
      </div>
    </div>
  );
} 