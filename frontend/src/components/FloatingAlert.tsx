import { CheckCircle, XCircle } from "lucide-react";
import React from "react";

export default function FloatingAlert({ type, msg, onClose }: { type: "success" | "error"; msg: string; onClose: () => void }) {
  return (
    <div className={`fixed top-8 right-8 z-[9999] flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg text-base font-semibold animate-fade-in ${type === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}
      style={{ minWidth: 260 }}>
      {type === "success" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 text-xl text-gray-400 hover:text-gray-700">×</button>
    </div>
  );
}

// Add fade-in animation
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `@keyframes fade-in { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease; }`;
  document.head.appendChild(style);
} 