"use client";
import { Bell, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const FAKE_ALERTS = [
  { type: "info", title: "System Update", desc: "A new version of the app is available.", time: "2 min ago" },
  { type: "success", title: "Payment Received", desc: "Your payment for July was successful.", time: "10 min ago" },
  { type: "warning", title: "Driver Delay", desc: "Driver Mohammad is late for trip #23.", time: "30 min ago" },
  { type: "error", title: "Vehicle Issue", desc: "Truck 12A345-IR needs urgent maintenance.", time: "1 hour ago" },
  { type: "info", title: "New Message", desc: "You have a new support message.", time: "2 hours ago" },
  { type: "success", title: "Trip Completed", desc: "Trip #45 was completed successfully.", time: "3 hours ago" },
  { type: "warning", title: "License Expiry", desc: "Driver Sara's license expires soon.", time: "Yesterday" },
  { type: "error", title: "Login Attempt", desc: "Failed login attempt detected.", time: "Yesterday" },
];

const ICONS = {
  info: <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  success: <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />,
  error: <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />,
};

const BG = {
  info: "from-blue-50 to-blue-100",
  success: "from-green-50 to-green-100",
  warning: "from-yellow-50 to-yellow-100",
  error: "from-red-50 to-red-100",
};

export default function AlertsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full h-full flex flex-col">
        <h1 className="font-extrabold text-2xl md:text-3xl mb-4 md:mb-6 lg:mb-8 text-blue-700 flex items-center gap-2 md:gap-3">
          <Bell className="w-6 h-6 md:w-8 md:h-8 text-blue-500" /> 
          <span className="text-lg md:text-xl lg:text-2xl">Alerts & Notifications</span>
        </h1>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 md:gap-6">
            {FAKE_ALERTS.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 md:gap-4 bg-gradient-to-r ${BG[a.type]} rounded-2xl shadow p-4 md:p-5 transition hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
              >
                <div className="mt-1 flex-shrink-0">{ICONS[a.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-blue-900 text-sm md:text-base lg:text-lg mb-1 flex items-center gap-2 flex-wrap">
                    <span className="break-words">{a.title}</span>
                    {a.type === "error" && <span className="text-xs bg-red-100 text-red-600 rounded px-2 py-0.5 ml-2 flex-shrink-0">Urgent</span>}
                    {a.type === "warning" && <span className="text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-0.5 ml-2 flex-shrink-0">Warning</span>}
                  </div>
                  <div className="text-gray-700 mb-1 text-sm md:text-base break-words">{a.desc}</div>
                  <div className="text-xs text-gray-400">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 