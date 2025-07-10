"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-blue-300">
      <div className="relative flex items-center justify-center">
        {/* افکت موجی دایره‌ای */}
        <span className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-blue-600 opacity-30 animate-ping"></span>
        <span className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-blue-300 via-purple-300 to-blue-500 opacity-50 animate-pulse"></span>
        {/* دایره مرکزی با افکت شاین */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-purple-400 to-blue-700 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-20 blur-xl animate-shine" />
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      </div>
      <span className="mt-8 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-blue-400 animate-pulse">
        Loading...
      </span>
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
} 