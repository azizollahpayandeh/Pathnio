"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  Car,
  Navigation,
  Maximize,
  Minimize,
  RefreshCw,
  Clock,
  TrendingUp,
  Zap,
  Globe,
  Settings,
  Filter,
  Play,
  Pause,
  Route,
  Signal,
  Wifi,
  Fuel,
  Download,
  FileText,
  Bell
} from "lucide-react";

const LiveMap = dynamic(() => import("../../../components/LiveMapWidget"), { ssr: false });

export default function LiveMapPage() {
  const [fullscreen, setFullscreen] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const refreshData = () => {
    setLastUpdate(new Date());
  };

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <>
      {!fullscreen && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
                    <Navigation className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2 truncate">Live Vehicle Map</h1>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg hidden sm:block">Real-time tracking and monitoring of your fleet</p>
                    <p className="text-gray-600 text-xs sm:hidden">Fleet tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-green-100 rounded-full">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-xs sm:text-sm font-semibold text-green-700">
                      {isLive ? 'LIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <button
                    onClick={toggleLiveMode}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 ${isLive
                        ? 'bg-red-100 hover:bg-red-200'
                        : 'bg-green-100 hover:bg-green-200'
                      }`}
                  >
                    {isLive ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={refreshData}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
                  >
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                {[
                  { label: "Active Vehicles", value: "12", icon: Car, color: "from-green-500 to-emerald-600", change: "+2" },
                  { label: "Total Distance", value: "1,247 km", icon: Route, color: "from-blue-500 to-indigo-600", change: "+15%" },
                  { label: "Average Speed", value: "45 km/h", icon: TrendingUp, color: "from-purple-500 to-pink-600", change: "+8%" },
                  { label: "Fuel Efficiency", value: "8.2 L/100km", icon: Fuel, color: "from-orange-500 to-red-600", change: "-3%" },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-right flex-1 min-w-0 ml-3">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
                          <div className="text-xs sm:text-sm text-gray-600 truncate">{stat.label}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{stat.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Last Update Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">Last updated: {mounted ? lastUpdate.toLocaleTimeString('fa-IR') : '--:--:--'}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Signal className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="hidden sm:inline">GPS Signal: Strong</span>
                    <span className="sm:hidden">GPS: Strong</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="hidden sm:inline">Network: Stable</span>
                    <span className="sm:hidden">Net: OK</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    <span className="hidden sm:inline">Real-Time Fleet Tracking</span>
                    <span className="sm:hidden">Fleet Tracking</span>
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none justify-center">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none justify-center">
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
                <LiveMap fullscreen={false} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-white/20">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: "Export Data", icon: Download, color: "from-blue-500 to-indigo-600" },
                  { label: "Generate Report", icon: FileText, color: "from-green-500 to-emerald-600" },
                  { label: "Alert Settings", icon: Bell, color: "from-purple-500 to-pink-600" },
                  { label: "Route Planning", icon: Route, color: "from-orange-500 to-red-600" },
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      className={`bg-gradient-to-r ${action.color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2 mx-auto" />
                      <div className="text-xs sm:text-sm font-semibold leading-tight">{action.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mode */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-[10000] flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs sm:text-sm font-semibold text-white">
                {isLive ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
            <button
              onClick={toggleLiveMode}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 ${isLive
                  ? 'bg-red-500/20 hover:bg-red-500/30'
                  : 'bg-green-500/20 hover:bg-green-500/30'
                }`}
            >
              {isLive ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              )}
            </button>
            <button
              onClick={refreshData}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-red-500/30 transition-all duration-200"
            >
              <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
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