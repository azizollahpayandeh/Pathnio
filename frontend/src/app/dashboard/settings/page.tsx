'use client';

import { useEffect, useState } from 'react';
import api from '../../api';
import FloatingAlert from '@/components/FloatingAlert';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Bell,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
  Lock,
  Cloud,
  Mail,
  MessageSquareText,
  CalendarDays,
  Ruler,
  FileText,
  ToggleRight,
  Palette,
  Shield,
  Database,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Settings {
  theme: 'light' | 'dark';
  language: 'en' | 'fa';
  email_notifications: boolean;
  sms_notifications: boolean;
  data_privacy_consent: boolean;
  backup_schedule: 'daily' | 'weekly' | 'monthly';
  date_time_format:
    | 'MM/DD/YYYY HH:mm'
    | 'DD/MM/YYYY HH:mm'
    | 'YYYY-MM-DD HH:mm:ss';
  measurement_unit: 'km' | 'mile';
  default_report_format: 'pdf' | 'excel' | 'csv';
}

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun, color: 'text-yellow-500' },
  { value: 'dark', label: 'Dark', icon: Moon, color: 'text-indigo-500' },
];

const LANGUAGES = [
  { value: 'en', label: 'English', icon: Globe, color: 'text-teal-500' },
  { value: 'fa', label: 'فارسی', icon: Globe, color: 'text-purple-500' },
];

const BACKUP_SCHEDULES = [
  { value: 'daily', label: 'Daily', icon: Zap, color: 'text-green-500' },
  { value: 'weekly', label: 'Weekly', icon: CalendarDays, color: 'text-blue-500' },
  { value: 'monthly', label: 'Monthly', icon: Database, color: 'text-orange-500' },
];

const DATE_TIME_FORMATS = [
  {
    value: 'MM/DD/YYYY HH:mm',
    label: 'MM/DD/YYYY HH:mm',
    example: '07/24/2025 23:40',
  },
  {
    value: 'DD/MM/YYYY HH:mm',
    label: 'DD/MM/YYYY HH:mm',
    example: '24/07/2025 23:40',
  },
  {
    value: 'YYYY-MM-DD HH:mm:ss',
    label: 'YYYY-MM-DD HH:mm:ss',
    example: '2025-07-24 23:40:13',
  },
];

const MEASUREMENT_UNITS = [
  { value: 'km', label: 'Kilometers (km)', icon: Ruler, color: 'text-green-500' },
  { value: 'mile', label: 'Miles (mi)', icon: Ruler, color: 'text-blue-500' },
];

const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Document', icon: FileText, color: 'text-red-500' },
  { value: 'excel', label: 'Excel Spreadsheet', icon: FileText, color: 'text-green-500' },
  { value: 'csv', label: 'CSV Format', icon: FileText, color: 'text-blue-500' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'en',
    email_notifications: true,
    sms_notifications: false,
    data_privacy_consent: false,
    backup_schedule: 'weekly',
    date_time_format: 'MM/DD/YYYY HH:mm',
    measurement_unit: 'km',
    default_report_format: 'pdf',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/accounts/site-settings/');
        if (response.data) {
          setSettings(prev => ({
            ...prev,
            ...response.data,
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch('/accounts/site-settings/', settings);
      setAlert({
        type: 'success',
        msg: 'Settings saved successfully!',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        msg: 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full filter blur-2xl opacity-20 animate-bounce" style={{animationDuration: '4s'}} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-green-200 to-teal-300 rounded-full filter blur-2xl opacity-20 animate-pulse" style={{animationDuration: '3s'}} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4 lg:mb-6 transform hover:scale-110 transition-all duration-300">
            <SettingsIcon className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 lg:mb-4">
            Dashboard Settings
          </h1>
          <p className="text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Customize your experience and manage your preferences with our comprehensive settings panel
          </p>
        </div>

        {alert && (
          <FloatingAlert
            type={alert.type}
            msg={alert.msg}
            onClose={() => setAlert(null)}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-6 text-xl font-semibold text-gray-700">Loading your preferences...</p>
            <p className="text-gray-500 mt-2">Please wait a moment while we fetch your settings</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Settings Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transform hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">General Settings</h2>
                  <p className="text-gray-600 mt-1">Customize the basic appearance and behavior</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Theme Selector */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      {settings.theme === 'light' ? (
                        <Sun className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <Moon className="h-6 w-6 text-indigo-500" />
                      )}
                      Theme
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {THEMES.map((theme) => {
                      const IconComponent = theme.icon;
                      return (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, theme: theme.value as 'light' | 'dark' }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            settings.theme === theme.value
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-6 w-6 ${theme.color}`} />
                            <span className="font-medium text-gray-700">{theme.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selector */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="h-6 w-6 text-teal-500" />
                      Language
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {LANGUAGES.map((lang) => {
                      const IconComponent = lang.icon;
                      return (
                        <button
                          key={lang.value}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, language: lang.value as 'en' | 'fa' }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            settings.language === lang.value
                              ? 'border-teal-500 bg-teal-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-6 w-6 ${lang.color}`} />
                            <span className="font-medium text-gray-700">{lang.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date/Time Format */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarDays className="h-6 w-6 text-amber-500" />
                      Date & Time Format
                    </div>
                  </label>
                  <select
                    name="date_time_format"
                    value={settings.date_time_format}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 text-lg shadow-sm transition-all duration-300 appearance-none"
                  >
                    {DATE_TIME_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label} - {format.example}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Measurement Unit */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Ruler className="h-6 w-6 text-green-500" />
                      Measurement Unit
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {MEASUREMENT_UNITS.map((unit) => {
                      const IconComponent = unit.icon;
                      return (
                        <button
                          key={unit.value}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, measurement_unit: unit.value as 'km' | 'mile' }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            settings.measurement_unit === unit.value
                              ? 'border-green-500 bg-green-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-6 w-6 ${unit.color}`} />
                            <span className="font-medium text-gray-700">{unit.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transform hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Notification Preferences</h2>
                  <p className="text-gray-600 mt-1">Manage how you receive updates and alerts</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Email Notifications</h3>
                      <p className="text-gray-600">Receive updates and alerts via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="email_notifications"
                      checked={settings.email_notifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500 rounded-xl">
                      <MessageSquareText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">SMS & In-App Notifications</h3>
                      <p className="text-gray-600">Get alerts directly on your device</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="sms_notifications"
                      checked={settings.sms_notifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy & Data Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transform hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Privacy & Data</h2>
                  <p className="text-gray-600 mt-1">Manage your data privacy and backup preferences</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Data Privacy Consent */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500 rounded-xl">
                      <ToggleRight className="h-6 w-6 text-white rotate-90" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Data Processing Consent</h3>
                      <p className="text-gray-600">Allow us to use your data for analytics and improvements</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="data_privacy_consent"
                      checked={settings.data_privacy_consent}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Backup Schedule */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Cloud className="h-6 w-6 text-sky-500" />
                      Automatic Backup Schedule
                    </div>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BACKUP_SCHEDULES.map((schedule) => {
                      const IconComponent = schedule.icon;
                      return (
                        <button
                          key={schedule.value}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, backup_schedule: schedule.value as 'daily' | 'weekly' | 'monthly' }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            settings.backup_schedule === schedule.value
                              ? 'border-sky-500 bg-sky-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-6 w-6 ${schedule.color}`} />
                            <span className="font-medium text-gray-700">{schedule.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Report Format */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-6 w-6 text-gray-600" />
                      Default Report Format
                    </div>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {REPORT_FORMATS.map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <button
                          key={format.value}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, default_report_format: format.value as 'pdf' | 'excel' | 'csv' }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            settings.default_report_format === format.value
                              ? 'border-gray-500 bg-gray-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-6 w-6 ${format.color}`} />
                            <span className="font-medium text-gray-700">{format.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={saving}
                className={`group relative px-12 py-4 text-xl font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer shadow-2xl hover:shadow-3xl'
                } text-white overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  {saving ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="h-6 w-6" />
                      Save All Settings
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Enhanced Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
