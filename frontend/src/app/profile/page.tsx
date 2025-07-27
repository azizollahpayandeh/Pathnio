"use client";
import React, { useEffect, useState, useRef } from "react";
import { User, Lock, Bell, LogOut, ArrowLeft, Camera, Shield, Settings, Calendar, Mail, Phone, MapPin, Globe } from "lucide-react";
import FloatingAlert from "@/components/FloatingAlert";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import Image from 'next/image';
import api from "../api";

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },  
  { value: "fa", label: "فارسی", flag: "🇮🇷" },
];

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  language?: string;
  date_joined: string;
  role: string;
  profile_photo?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Check if user is authenticated
      if (typeof window !== "undefined") {
        const access = localStorage.getItem("access");
        if (!access) {
          console.log("No access token found, redirecting to login");
          router.push("/login");
          return;
        }
      }

      try {
        const res = await api.get("accounts/profile/");
        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
        // If there's an authentication error, redirect to login
        if (error && typeof error === "object" && "response" in error && (error as any).response?.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // Floating alert auto-close
  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      await api.patch("accounts/company/me/", {
        manager_full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        address: profile?.address ?? "",
        language: profile?.language ?? "en",
      });
      // Fetch updated profile for localStorage sync
      const res = await api.get("accounts/profile/");
      setProfile(res.data);
      setAlert({ type: "success", msg: "Profile updated successfully!" });
      // Update localStorage user for dashboard header sync
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            const updatedUser = {
              ...userObj,
              full_name: res.data.full_name,
              company_name: res.data.company_name,
              profile_photo: res.data.profile_photo || "/assets/images.png",
              phone: res.data.phone,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch {}
        }
      }
    } catch {
      setAlert({ type: "error", msg: "Profile update failed." });
    }
    setLoading(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !profile) return;
    const formData = new FormData();
    formData.append("profile_photo", e.target.files[0]);
    try {
      await api.patch("accounts/company/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Fetch fresh profile data to get the new photo URL
      const res = await api.get("accounts/profile/");
      setProfile(res.data);
      setAlert({ type: "success", msg: "Profile photo updated!" });
    } catch {
      setAlert({ type: "error", msg: "Photo upload failed." });
    }
  };

  const getProfilePhotoUrl = (photo: string | undefined) => {
    if (!photo) return "/assets/images.png";
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("/media/")) {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      return base + photo;
    }
    return photo;
  };

  const handlePasswordChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Password',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Current Password" type="password">
        <input id="swal-input2" class="swal2-input" placeholder="New Password" type="password">
        <input id="swal-input3" class="swal2-input" placeholder="Confirm New Password" type="password">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const currentPassword = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const newPassword = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('swal-input3') as HTMLInputElement).value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('New passwords do not match');
          return false;
        }
        
        if (newPassword.length < 6) {
          Swal.showValidationMessage('Password must be at least 6 characters');
          return false;
        }
        
        return { currentPassword, newPassword };
      }
    });

    if (formValues) {
      try {
        await api.post("accounts/auth/password/change/", {
          old_password: formValues.currentPassword,
          new_password: formValues.newPassword
        });
        setAlert({ type: "success", msg: "Password changed successfully!" });
      } catch (error: any) {
        const errorMsg = error?.response?.data?.detail || "Failed to change password";
        setAlert({ type: "error", msg: errorMsg });
      }
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'خروج از حساب کاربری',
      text: 'آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'بله، خروج',
      cancelButtonText: 'انصراف',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: 'در حال خروج...',
        text: 'لطفاً صبر کنید',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        // Try to call logout API
        await api.post("accounts/auth/logout/");
        
        // Clear all authentication data
        if (typeof window !== "undefined") {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          
          // Clear any other potential auth-related data
          sessionStorage.clear();
          
          // Clear any cookies if they exist
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        }

        // Show success message
        Swal.fire({
          title: 'خروج موفقیت‌آمیز',
          text: 'شما با موفقیت از حساب کاربری خود خارج شدید',
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'باشه'
        }).then(() => {
          // Redirect to home page
          router.push('/');
        });

      } catch (error) {
        console.error('Logout error:', error);
        
        // Even if logout API fails, clear local storage and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          sessionStorage.clear();
        }

        // Show success message even if API fails
        Swal.fire({
          title: 'خروج انجام شد',
          text: 'شما از حساب کاربری خود خارج شدید',
          icon: 'info',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'باشه'
        }).then(() => {
          // Redirect to home page
          router.push('/');
        });
      }
    }
  };

  const handleSettings = () => {
    // For future settings functionality
    setAlert({ type: "success", msg: "Settings feature coming soon!" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="mt-6 text-xl font-bold text-gray-800">Loading Profile...</div>
          <div className="text-gray-500 mt-2">Please wait a moment</div>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div className="text-xl font-bold text-gray-800 mb-2">Error</div>
          <div className="text-gray-600">Failed to load profile data</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-xl hover:bg-white text-gray-700 font-semibold rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Profile Settings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your personal information and account security settings
            </p>
          </div>

          <div className="flex lg:flex-row flex-col gap-8">
            {/* Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 h-full">
                {/* Profile Photo */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <Image
                        src={getProfilePhotoUrl(profile.profile_photo)}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                      />
                      <button
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl border-2 border-white hover:scale-110 transition-all duration-300 group"
                        onClick={() => fileInput.current?.click()}
                        title="Change photo"
                      >
                        <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInput}
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile.full_name || "User"}</h2>
                    <p className="text-gray-600 mb-3">{profile.email}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full font-semibold text-sm border border-blue-200">
                      <Shield className="w-4 h-4" />
                      {profile.role}
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-semibold text-gray-800">{profile.phone || "Not set"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">Joined</div>
                      <div className="font-semibold text-gray-800">
                        {new Date(profile.date_joined).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                  {profile.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="font-semibold text-gray-800">{profile.address}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold">Profile</div>
                      <div className="text-xs opacity-90">Personal information</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
                      activeTab === 'security'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold">Security</div>
                      <div className="text-xs opacity-90">Password & security</div>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold">Logout</div>
                      <div className="text-xs opacity-90">Sign out</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-2/3">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 h-full">
                {activeTab === 'profile' && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">Personal Information</h3>
                      <p className="text-gray-600">Update your profile details and preferences</p>
                    </div>
                    
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={profile.full_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={profile.address || ""}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                            placeholder="Enter your address"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Globe className="w-4 h-4 inline mr-2" />
                            Language
                          </label>
                          <select
                            name="language"
                            value={profile.language || "en"}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.value} value={lang.value}>
                                {lang.flag} {lang.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          type="submit"
                          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Saving Changes...
                            </div>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Additional Info Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Profile Tips
                        </h4>
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Keep your profile information up to date for better account management</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Your profile photo helps others recognize you in the system</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Language preference affects the interface display and notifications</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">Security Settings</h3>
                      <p className="text-gray-600">Change your password and manage security preferences</p>
                    </div>
                    
                    <form
                      className="space-y-6"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                        const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                        const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                        
                        if (!currentPassword || !newPassword || !confirmPassword) {
                          setAlert({ type: 'error', msg: 'Please fill in all fields.' });
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          setAlert({ type: 'error', msg: 'New passwords do not match.' });
                          return;
                        }
                        if (newPassword.length < 6) {
                          setAlert({ type: 'error', msg: 'Password must be at least 6 characters.' });
                          return;
                        }
                        
                        try {
                          await api.post("accounts/auth/password/change/", {
                            old_password: currentPassword,
                            new_password: newPassword
                          });
                          setAlert({ type: "success", msg: "Password changed successfully!" });
                          (e.target as HTMLFormElement).reset();
                        } catch (error: any) {
                          const errorMsg = error?.response?.data?.detail || "Failed to change password";
                          setAlert({ type: "error", msg: errorMsg });
                        }
                      }}
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <Lock className="w-4 h-4 inline mr-2" />
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <Shield className="w-4 h-4 inline mr-2" />
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <Shield className="w-4 h-4 inline mr-2" />
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300 hover:shadow-md"
                          required
                        />
                      </div>
                      
                      <div className="pt-6">
                        <button
                          type="submit"
                          className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg cursor-pointer"
                        >
                          Change Password
                        </button>
                      </div>
                    </form>

                    {/* Security Tips Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Guidelines
                        </h4>
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Use a strong password with at least 8 characters including numbers and symbols</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Never share your password with anyone or use it on other websites</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p>Consider changing your password regularly for enhanced security</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
} 