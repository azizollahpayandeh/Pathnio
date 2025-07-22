import React from 'react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-red-200">
        <h1 className="text-7xl font-extrabold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Forbidden</h2>
        <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
        <Link href="/" className="px-6 py-2 bg-red-500 text-white rounded-xl font-semibold shadow hover:bg-red-600 transition">Go Home</Link>
      </div>
    </div>
  );
} 