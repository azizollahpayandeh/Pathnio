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
  CalendarDays, // For Date/Time Format
  Ruler, // For Measurement Unit
  FileText, // For Report Defaults
  ToggleRight, // For advanced toggles
} from 'lucide-react';

// ✅ Define precise and TypeScript-error-free interfaces for settings
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
    | 'YYYY-MM-DD HH:mm:ss'; // New setting
  measurement_unit: 'km' | 'mile'; // New setting
  default_report_format: 'pdf' | 'excel' | 'csv'; // New setting
}

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'Farsi' },
];

const BACKUP_SCHEDULES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const DATE_TIME_FORMATS = [
  {
    value: 'MM/DD/YYYY HH:mm',
    label: 'MM/DD/YYYY HH:mm (e.g., 07/24/2025 23:40)',
  },
  {
    value: 'DD/MM/YYYY HH:mm',
    label: 'DD/MM/YYYY HH:mm (e.g., 24/07/2025 23:40)',
  },
  {
    value: 'YYYY-MM-DD HH:mm:ss',
    label: 'YYYY-MM-DD HH:mm:ss (e.g., 2025-07-24 23:40:13)',
  },
];

const MEASUREMENT_UNITS = [
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'mile', label: 'Miles (mi)' },
];

const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'excel', label: 'Excel Spreadsheet (.xlsx)' },
  { value: 'csv', label: 'CSV (Comma Separated Values)' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'en',
    email_notifications: true,
    sms_notifications: false,
    data_privacy_consent: false,
    backup_schedule: 'weekly',
    date_time_format: 'MM/DD/YYYY HH:mm', // Default for new setting
    measurement_unit: 'km', // Default for new setting
    default_report_format: 'pdf', // Default for new setting
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
        setLoading(true);
        // Simulate API call
        const res = await api.get<Settings>('accounts/site-settings/');
        setSettings(res.data);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setAlert({
          type: 'error',
          msg: 'Failed to load settings. Please try again.',
        });
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
    const checked = (e.target as HTMLInputElement).checked; // Explicitly cast for checkbox
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
      await api.patch('accounts/site-settings/', settings);
      setAlert({ type: 'success', msg: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setAlert({
        type: 'error',
        msg: 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-blue-100 transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.005] animate-fade-in-up">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <h1 className="flex items-center gap-3 text-4xl font-extrabold text-blue-800 tracking-tight">
            Dashboard Settings
          </h1>
        </div>

        {alert && (
          <FloatingAlert
            type={alert.type}
            msg={alert.msg}
            onClose={() => setAlert(null)}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-blue-500">
            <Loader2 className="h-16 w-16 animate-spin-slow text-blue-400" />
            <p className="mt-4 text-xl font-medium">
              Loading your preferences...
            </p>
            <p className="text-gray-500 text-sm mt-1">Please wait a moment.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* General Settings Section */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow-inner border border-blue-100">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-blue-700 mb-6 border-b border-blue-200 pb-3">
                <SettingsIcon className="h-6 w-6 text-blue-500" />
                General Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Selector */}
                <div>
                  <label
                    htmlFor="theme"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    {settings.theme === 'light' ? (
                      <Sun className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-indigo-500" />
                    )}
                    Theme
                  </label>
                  <select
                    id="theme"
                    name="theme"
                    value={settings.theme}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 text-base shadow-sm transition-all duration-200 appearance-none focus:outline-none focus:ring-opacity-50"
                  >
                    {THEMES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Adjust the visual appearance of the dashboard.
                  </p>
                </div>

                {/* Language Selector */}
                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-teal-500" />
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 text-base shadow-sm transition-all duration-200 appearance-none focus:outline-none focus:ring-opacity-50"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your preferred display language.
                  </p>
                </div>

                {/* Date/Time Format Selector */}
                <div>
                  <label
                    htmlFor="date_time_format"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <CalendarDays className="h-4 w-4 text-amber-500" />
                    Date & Time Format
                  </label>
                  <select
                    id="date_time_format"
                    name="date_time_format"
                    value={settings.date_time_format}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 text-base shadow-sm transition-all duration-200 appearance-none focus:outline-none focus:ring-opacity-50"
                  >
                    {DATE_TIME_FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose how dates and times are displayed.
                  </p>
                </div>

                {/* Measurement Unit Selector */}
                <div>
                  <label
                    htmlFor="measurement_unit"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Ruler className="h-4 w-4 text-green-500" />
                    Measurement Unit
                  </label>
                  <select
                    id="measurement_unit"
                    name="measurement_unit"
                    value={settings.measurement_unit}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 text-base shadow-sm transition-all duration-200 appearance-none focus:outline-none focus:ring-opacity-50"
                  >
                    {MEASUREMENT_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Set preferred unit for distance and capacity.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-700 mb-6 border-b border-gray-200 pb-3">
                <Bell className="h-6 w-6 text-orange-500" />
                Notification Preferences
              </h2>
              <div className="flex flex-col gap-4">
                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                  <label
                    htmlFor="email_notifications"
                    className="text-base font-medium text-gray-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="h-5 w-5 text-blue-500" />
                    Email Notifications
                    <p className="text-xs text-gray-500 ml-2">
                      Receive updates and alerts via email.
                    </p>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email_notifications"
                      name="email_notifications"
                      checked={settings.email_notifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* SMS/In-App Notifications Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                  <label
                    htmlFor="sms_notifications"
                    className="text-base font-medium text-gray-800 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquareText className="h-5 w-5 text-purple-500" />
                    SMS & In-App Notifications
                    <p className="text-xs text-gray-500 ml-2">
                      Get alerts directly on your device or within the app.
                    </p>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="sms_notifications"
                      name="sms_notifications"
                      checked={settings.sms_notifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy & Data Settings Section */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow-inner border border-blue-100">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-blue-700 mb-6 border-b border-blue-200 pb-3">
                <Lock className="h-6 w-6 text-pink-500" />
                Privacy & Data
              </h2>
              <div className="flex flex-col gap-4">
                {/* Data Privacy Consent Toggle */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <label
                    htmlFor="data_privacy_consent"
                    className="text-base font-medium text-gray-800 flex items-center gap-2 cursor-pointer"
                  >
                    <ToggleRight className="h-5 w-5 text-indigo-500 rotate-90" />
                    Consent to Data Processing
                    <p className="text-xs text-gray-500 ml-2">
                      Allows us to use your data for advanced analytics and
                      feature improvements.{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Learn more.
                      </a>
                    </p>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="data_privacy_consent"
                      name="data_privacy_consent"
                      checked={settings.data_privacy_consent}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Backup Schedule Selector */}
                <div>
                  <label
                    htmlFor="backup_schedule"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Cloud className="h-4 w-4 text-sky-500" />
                    Automatic Backup Schedule
                  </label>
                  <select
                    id="backup_schedule"
                    name="backup_schedule"
                    value={settings.backup_schedule}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 text-base shadow-sm transition-all duration-200 appearance-none focus:outline-none focus:ring-opacity-50"
                  >
                    {BACKUP_SCHEDULES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Set how frequently your data is backed up.
                  </p>
                </div>

                {/* Default Report Format */}
                <div>
                  <label
                    htmlFor="default_report_format"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    Default Report Format
                  </label>
                  <select
                    id="default_report_format"
                    name="default_report_format"
                    value={settings.default_report_format}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 text-base shadow-sm transition-all duration-200 appearance-none focus:outline-none focus:ring-opacity-50"
                  >
                    {REPORT_FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the default file type for downloaded reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 shadow-lg mt-4 text-lg
                ${
                  saving
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
                }
                text-white transform hover:-translate-y-1`}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  Save Settings
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        /* Custom select arrow */
        select {
          -moz-appearance: none; /* Firefox */
          -webkit-appearance: none; /* Safari and Chrome */
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='292.4' height='292.4' viewBox='0 0 292.4 292.4'%3E%3Cpath fill='%236B7280' d='M287 69.4a17.6 17.6 0 0 0-13.7-6.9H19.2c-5 0-9.6 2.3-13.7 6.9-4.1 4.6-6.3 10.6-6.3 16.6 0 6 2.2 12 6.3 16.6l128 128c4.1 4.6 9.6 6.9 13.7 6.9s9.6-2.3 13.7-6.9l128-128c4.1-4.6 6.3-10.6 6.3-16.6s-2.2-12-6.3-16.6z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 0.8em;
          padding-right: 2.5rem; /* Ensure space for the custom arrow */
        }
      `}</style>
    </div>
  );
}
