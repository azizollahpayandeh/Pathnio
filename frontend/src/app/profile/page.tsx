"use client";
import React, { useRef, useState, useEffect } from "react";
import api from "../api";
import { User, Lock, Bell, LogOut, ArrowLeft } from "lucide-react";
import FloatingAlert from "@/components/FloatingAlert";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import Image from 'next/image';

// Replace 'any' with a specific User type
interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  manager_full_name?: string;
  phone?: string;
  mobile?: string;
  profile_photo?: string;
  date_joined?: string;
  // Add more fields as needed
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
];
const TABS = [
  { key: "profile", label: "Profile Info", icon: <User className="w-5 h-5" /> },
  { key: "security", label: "Security", icon: <Lock className="w-5 h-5" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
];

// تعریف type مناسب برای خطاها و داده‌ها
interface ApiError {
  response?: {
    data?: { detail?: string } | string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({ full_name: "", phone: "", address: "", language: "en" });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [notif, setNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwAlert, setPwAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        setEditData({
          full_name: u.full_name || u.manager_full_name || u.fullName || "",
          phone: u.phone || u.mobile || "",
          address: u.address || "",
          language: u.language || "en",
        });
        setNotif(u.email_notifications ?? true);
        setTwoFA(u.two_fa_enabled ?? false);
      }
    }
  }, []);

  // Debug function to log user state
  const debugUserState = () => {
    console.log("Current user state:", user);
    console.log("Profile photo URL:", getProfilePhotoUrl(user?.profile_photo));
    console.log("LocalStorage user:", localStorage.getItem("user"));
  };

  // Call debug function when user changes
  useEffect(() => {
    debugUserState();
  }, [user]);

  // Profile update
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    let userError = null;
    let companyError = null;
    try {
      // Update user (email)
      if (user?.email !== editData.email && editData.email) {
        await api.patch("auth/users/me/", { email: editData.email });
      }
    } catch (err: unknown) {
      let msg = "User update failed.";
      if (typeof err === "object" && err && "response" in err && (err as ApiError).response?.data) {
        if (typeof (err as ApiError).response?.data === "string") msg = (err as ApiError).response?.data as string;
        else if (typeof (err as ApiError).response?.data === "object" && (err as ApiError).response?.data?.detail) msg = (err as ApiError).response?.data.detail!;
      }
      userError = msg;
    }
    try {
      // Update company profile
      await api.patch("accounts/company/me/", {
        company_name: editData.company_name,
        manager_full_name: editData.full_name,
        phone: editData.phone,
        address: editData.address,
      });
    } catch (err: unknown) {
      let msg = "Company update failed.";
      if (typeof err === "object" && err && "response" in err && (err as ApiError).response?.data) {
        if (typeof (err as ApiError).response?.data === "string") msg = (err as ApiError).response?.data as string;
        else if (typeof (err as ApiError).response?.data === "object" && (err as ApiError).response?.data?.detail) msg = (err as ApiError).response?.data.detail!;
      }
      companyError = msg;
    }
    if (!userError && !companyError) {
      setAlert({ type: "success", msg: "Profile updated successfully!" });
      // Refresh both user and company data to keep the photo
      const userRes = await api.get("auth/users/me/");
      const companyRes = await api.get("accounts/company/me/");
      
      // Merge user and company data
      const updatedUser = {
        ...userRes.data,
        ...companyRes.data,
        is_manager: !!companyRes.data.id,
        is_staff: userRes.data.is_staff,
        date_joined: userRes.data.date_joined,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } else {
      setAlert({ type: "error", msg: userError || companyError });
    }
    setLoading(false);
  };

  // Profile photo upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("profile_photo", e.target.files[0]);
    try {
      // Update company profile photo
      const response = await api.patch("accounts/company/me/", formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      console.log("Photo upload response:", response.data);
      setAlert({ type: "success", msg: "Profile photo updated!" });
      
      // Refresh company data to get the new photo URL
      const companyRes = await api.get("accounts/company/me/");
      const userRes = await api.get("auth/users/me/");
      
      // Update localStorage with new data including the photo
      const updatedUser = { ...userRes.data, ...companyRes.data };
      console.log("Updated user data:", updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error("Photo upload error:", err);
      setAlert({ type: "error", msg: "Photo upload failed." });
    }
  };

  // Security: Change password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwAlert(null);
    const form = e.target as HTMLFormElement;
    const current = (form.elements.namedItem("current") as HTMLInputElement).value;
    const newpw = (form.elements.namedItem("new") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;
    if (!current || !newpw || !confirm) {
      setPwAlert({ type: "error", msg: "All fields are required." });
      setPwLoading(false);
      return;
    }
    if (newpw !== confirm) {
      setPwAlert({ type: "error", msg: "Passwords do not match." });
      setPwLoading(false);
      return;
    }
    try {
      await api.post("auth/users/set_password/", { current_password: current, new_password: newpw });
      setPwAlert({ type: "success", msg: "Password changed successfully!" });
      form.reset();
    } catch (err: unknown) {
      let msg = "Password change failed.";
      if (typeof err === "object" && err && "response" in err && (err as ApiError).response?.data) {
        if (typeof (err as ApiError).response?.data === "string") msg = (err as ApiError).response?.data as string;
        else if (typeof (err as ApiError).response?.data === "object" && (err as ApiError).response?.data?.detail) msg = (err as ApiError).response?.data.detail!;
      }
      setPwAlert({ type: "error", msg });
    } finally {
      setPwLoading(false);
    }
  };

  // Notification toggle
  const handleNotifToggle = async () => {
    setNotif((prev) => !prev);
    try {
      await api.patch("auth/users/me/", { email_notifications: !notif });
    } catch {}
  };
  // 2FA toggle
  const handle2FAToggle = async () => {
    setTwoFA((prev) => !prev);
    try {
      await api.patch("auth/users/me/", { two_fa_enabled: !twoFA });
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAlert({ type: "success", msg: "Logged out successfully!" });
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  // Controlled input fix: always string
  const safe = (v: any) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

  const getProfilePhotoUrl = (photo: string | undefined) => {
    console.log("Getting photo URL for:", photo);
    if (!photo) {
      console.log("No photo, using default");
      return "/assets/images.png";
    }
    if (photo.startsWith("http")) {
      console.log("Photo is already full URL:", photo);
      return photo;
    }
    if (photo.startsWith("/media/")) {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const fullUrl = base + photo;
      console.log("Built full URL:", fullUrl);
      return fullUrl;
    }
    console.log("Photo is relative path:", photo);
    return photo;
  };

  // Floating alert auto-close
  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alert]);
  useEffect(() => {
    if (pwAlert) {
      const t = setTimeout(() => setPwAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [pwAlert]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-4 md:py-8 px-4">
      {/* Enhanced decorative elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full filter blur-2xl opacity-20 animate-bounce" style={{animationDuration: '3s'}} />
      
      {/* Back to Dashboard Button - Smaller and repositioned */}
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-blue-700 font-semibold rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105 text-sm cursor-pointer"
        style={{ cursor: 'pointer' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      {/* Floating Alerts */}
      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
      {pwAlert && <FloatingAlert type={pwAlert.type} msg={pwAlert.msg} onClose={() => setPwAlert(null)} />}
      
      <div className="w-full max-w-7xl bg-white/95 rounded-3xl shadow-2xl p-0 relative z-10 backdrop-blur-xl border border-white/50 overflow-hidden flex flex-col lg:flex-row">
        {/* Enhanced Sidebar */}
        <aside className="w-full lg:w-80 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 border-r border-blue-100 flex flex-col p-6 md:p-8 lg:p-10">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl w-full text-blue-700 font-semibold transition-all duration-300 mb-2 md:mb-3 ${
                activeTab === tab.key 
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 shadow-lg border border-blue-200 transform scale-105" 
                  : "hover:bg-blue-50 hover:shadow-md hover:scale-105"
              } cursor-pointer`}
              onClick={() => setActiveTab(tab.key)}
              style={{ cursor: 'pointer' }}
            >
              <span className="text-lg md:text-xl">{tab.icon}</span>
              <span className="text-base md:text-lg">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={async () => {
              const result = await Swal.fire({
                title: 'Are you sure you want to logout?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#d1d5db',
                confirmButtonText: 'Yes, logout',
                cancelButtonText: 'Cancel',
                background: '#fff',
                customClass: {
                  popup: 'rounded-2xl shadow-lg',
                  confirmButton: 'bg-blue-600 text-white rounded-lg px-6 py-2 font-bold',
                  cancelButton: 'bg-gray-200 text-gray-700 rounded-lg px-6 py-2 font-bold',
                },
              });
              if (result.isConfirmed) handleLogout();
            }}
            className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl w-full text-gray-500 font-semibold transition-all duration-300 mt-4 md:mt-6 border border-red-200 shadow-md hover:bg-red-50 hover:text-red-600 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer"
            title="Logout"
            style={{ cursor: 'pointer' }}
          >
            <LogOut className="w-5 h-5 md:w-6 md:h-6 transition-colors duration-200" />
            <span className="text-base md:text-lg">Logout</span>
          </button>
        </aside>
        
        {/* Enhanced Main Content */}
        <main className="flex-1 p-6 md:p-8 lg:p-12">
          {activeTab === "profile" && (
            <div className="animate-fade-in">
              <h2 className="font-extrabold text-3xl md:text-4xl text-blue-700 mb-8 md:mb-12 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profile Information
              </h2>
              <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center lg:items-start">
                {/* Enhanced Profile Photo Section */}
                <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100 w-full lg:min-w-[300px] lg:w-auto">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 md:mb-6">
                    <Image
                      src={getProfilePhotoUrl(user?.profile_photo)}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 md:p-3 shadow-lg hover:shadow-xl border-2 border-white hover:scale-110 transition-all duration-300 cursor-pointer"
                      onClick={() => fileInput.current?.click()}
                      title="Upload photo"
                      style={{ cursor: 'pointer' }}
                    >
                      <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInput}
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl md:text-2xl text-blue-700 mb-2">{user?.full_name || user?.manager_full_name || user?.fullName || "-"}</div>
                    <div className="text-gray-600 text-base md:text-lg mb-2">{user?.email}</div>
                    <div className="text-gray-500 text-sm md:text-base mb-3">{user?.phone || user?.mobile || "-"}</div>
                    <div className="inline-block px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-semibold text-xs md:text-sm border border-blue-200">
                      {user?.is_manager || user?.is_staff ? "Manager" : "User"}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 md:mt-3">
                      Joined: {user?.date_joined
                        ? new Date(user.date_joined).toLocaleString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : "-"}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Editable Form */}
                <form className="flex-1 space-y-6 md:space-y-8 w-full max-w-2xl" onSubmit={handleEditSubmit}>
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
                    <h3 className="font-bold text-xl md:text-2xl text-blue-700 mb-4 md:mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                        <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={safe(editData.full_name)}
                      onChange={handleEditChange}
                          className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                        <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={safe(editData.phone)}
                      onChange={handleEditChange}
                          className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300"
                      required
                    />
                  </div>
                    </div>
                    <div className="mt-4 md:mt-6">
                      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={safe(editData.address)}
                      onChange={handleEditChange}
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300"
                      placeholder="Optional"
                    />
                  </div>
                    <div className="mt-4 md:mt-6">
                      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Language</label>
                    <select
                      name="language"
                      value={safe(editData.language)}
                      onChange={handleEditChange}
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer text-lg md:text-xl transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                        Saving Changes...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === "security" && (
            <div className="animate-fade-in">
              <h2 className="font-extrabold text-3xl md:text-4xl text-blue-700 mb-8 md:mb-12 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Security Settings
              </h2>
              <div className="max-w-2xl">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
                  <h3 className="font-bold text-xl md:text-2xl text-blue-700 mb-4 md:mb-6">Change Password</h3>
                  <form className="space-y-4 md:space-y-6" onSubmit={handlePasswordChange}>
            <div>
                      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Current Password</label>
                      <input 
                        type="password" 
                        name="current" 
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300" 
                        required 
                      />
                </div>
                <div>
                      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">New Password</label>
                      <input 
                        type="password" 
                        name="new" 
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300" 
                        required 
                      />
                </div>
                <div>
                      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Confirm New Password</label>
                      <input 
                        type="password" 
                        name="confirm" 
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base md:text-lg shadow-sm transition-all duration-300" 
                        required 
                      />
                </div>
                <button
                  type="submit"
                      className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer text-lg md:text-xl transform hover:scale-105"
                  disabled={pwLoading}
                >
                      {pwLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                          Changing Password...
                        </div>
                      ) : (
                        "Change Password"
                      )}
                </button>
              </form>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "notifications" && (
            <div className="animate-fade-in">
              <h2 className="font-extrabold text-3xl md:text-4xl text-blue-700 mb-8 md:mb-12 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notifications
              </h2>
              <div className="max-w-4xl">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100 mb-6 md:mb-8">
                  <h3 className="font-bold text-xl md:text-2xl text-blue-700 mb-4 md:mb-6">Notification Settings</h3>
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-200">
            <div>
                      <span className="text-blue-900 font-semibold text-lg md:text-xl">Email Notifications</span>
                      <p className="text-gray-600 mt-1 text-sm md:text-base">Receive important updates via email</p>
                    </div>
                  <button
                      className={`relative w-14 h-8 md:w-16 md:h-10 rounded-full transition-colors duration-300 focus:outline-none shadow-lg ${
                        notif ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                      }`}
                    onClick={handleNotifToggle}
                    aria-pressed={notif}
                  >
                      <span className={`absolute left-1 top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white shadow-md transition-transform duration-300 ${
                        notif ? 'translate-x-6' : ''
                      }`}></span>
                  </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
                  <h3 className="font-bold text-xl md:text-2xl text-blue-700 mb-4 md:mb-6">Recent Notifications</h3>
                  <div className="space-y-3 md:space-y-4">
                  <NotificationCard
                    title="New login to your account"
                    description="A new login to your account was detected from Chrome in Tehran."
                    time="2 minutes ago"
                    unread
                  />
                  <NotificationCard
                    title="Payment Successful"
                    description="Your monthly subscription payment was successful."
                    time="1 hour ago"
                  />
                  <NotificationCard
                    title="App Update"
                    description="A new version of the app with more features is now available."
                    time="Yesterday"
                  />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
}

function NotificationCard({ title, description, time, unread }: { title: string; description: string; time: string; unread?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 p-6 rounded-2xl shadow-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 relative transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      unread ? "ring-2 ring-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50" : ""
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse shadow-lg ${
          unread ? 'visible' : 'hidden'
        }`}></span>
        <span className="font-bold text-blue-800 text-lg">{title}</span>
        {unread && (
          <span className="ml-auto px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full">
            NEW
          </span>
        )}
      </div>
      <span className="text-gray-700 text-base leading-relaxed">{description}</span>
      <span className="text-sm text-gray-500 self-end font-medium">{time}</span>
    </div>
  );
} 