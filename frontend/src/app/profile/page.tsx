"use client";
import React, { useEffect, useState, useRef } from "react";
import { User, Lock, Bell, LogOut, ArrowLeft } from "lucide-react";
import FloatingAlert from "@/components/FloatingAlert";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import Image from 'next/image';
import api from "../api";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
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
      try {
        const res = await api.get("accounts/profile/");
        setProfile(res.data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.post("accounts/auth/logout/");
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.push('/');
      } catch (error) {
        // Even if logout API fails, clear local storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.push('/');
      }
    }
  };

  const handleSettings = () => {
    // For future settings functionality
    setAlert({ type: "success", msg: "Settings feature coming soon!" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-white/50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-blue-700 font-semibold text-lg">Loading Profile...</div>
        </div>
      </div>
    </div>
  );
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-white/50">
        <div className="flex flex-col items-center">
          <div className="text-red-600 font-semibold text-lg mb-2">Error</div>
          <div className="text-gray-600">Failed to load profile data</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-4 md:py-8 px-4">
      {/* Enhanced decorative elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full filter blur-2xl opacity-20 animate-bounce" style={{animationDuration: '3s'}} />
      
      {/* Back to Dashboard Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-blue-700 font-semibold rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105 text-sm cursor-pointer"
        style={{ cursor: 'pointer' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      <div className="w-full max-w-7xl bg-white/95 rounded-3xl shadow-2xl p-0 relative z-10 backdrop-blur-xl border border-white/50 overflow-hidden flex flex-col lg:flex-row">
        <main className="flex-1 p-6 md:p-8 lg:p-12">
          <div className="animate-fade-in">
            <h2 className="font-extrabold text-3xl md:text-4xl text-blue-700 mb-8 md:mb-12 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Information
            </h2>
            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 min-h-[520px]">
              {/* Navigation Sidebar */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100 w-full lg:w-80 flex-shrink-0 flex flex-col justify-between min-h-[520px]">
                <div className="text-center mb-8">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
                    <Image
                      src={getProfilePhotoUrl(profile.profile_photo)}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                    />
                    <button
                      className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 shadow-lg hover:shadow-xl border-2 border-white hover:scale-110 transition-all duration-300 cursor-pointer"
                      onClick={() => fileInput.current?.click()}
                      title="Upload photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                  <div className="font-bold text-lg md:text-xl text-blue-700 mb-1">{profile.full_name || "-"}</div>
                  <div className="text-gray-600 text-sm md:text-base mb-2">{profile.email}</div>
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-semibold text-xs border border-blue-200">
                    {profile.role}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'security'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold">Security</div>
                      <div className="text-xs opacity-90">Change password</div>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <LogOut className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold">Logout</div>
                      <div className="text-xs opacity-90">Sign out</div>
                    </div>
                  </button>
                </div>

                {/* Account Status */}
                <div className="mt-6 p-4 bg-blue-100 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Account Status</span>
                  </div>
                  <div className="mt-2 text-blue-600 text-xs">
                    Last login: {new Date().toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"})}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col justify-center">
                {activeTab === 'profile' && (
                  <div className="h-full flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-12 shadow-xl border border-blue-100 min-h-[520px]">
                    <div className="text-center mb-8">
                      <h3 className="font-bold text-2xl md:text-3xl text-blue-700 mb-2">Profile Information</h3>
                      <p className="text-blue-600">Manage your personal information</p>
                    </div>
                    <form onSubmit={handleEditSubmit} className="max-w-2xl mx-auto space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="full_name"
                            value={profile.full_name}
                            onChange={handleInputChange}
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleInputChange}
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={profile.address || ""}
                            onChange={handleInputChange}
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Language</label>
                          <select
                            name="language"
                            value={profile.language || "en"}
                            onChange={handleInputChange}
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
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
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="h-full flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-12 shadow-xl border border-blue-100 min-h-[520px]">
                    <div className="text-center mb-8">
                      <h3 className="font-bold text-2xl md:text-3xl text-blue-700 mb-2">Security Settings</h3>
                      <p className="text-blue-600">Change your password and security settings</p>
                    </div>
                    <div className="w-full">
                      <form
                        className="space-y-8 w-full"
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
                          } catch (error: any) {
                            const errorMsg = error?.response?.data?.detail || "Failed to change password";
                            setAlert({ type: "error", msg: errorMsg });
                          }
                        }}
                      >
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-900 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                        >
                          Change Password
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
} 