"use client";
import React, { useRef, useState, useEffect } from "react";
import api from "../api";
import { User, Lock, Bell, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
];
const TABS = [
  { key: "profile", label: "Profile Info", icon: <User className="w-5 h-5" /> },
  { key: "security", label: "Security", icon: <Lock className="w-5 h-5" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
];

function FloatingAlert({ type, msg, onClose }: { type: "success" | "error"; msg: string; onClose: () => void }) {
  return (
    <div className={`fixed top-8 right-8 z-[9999] flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg text-base font-semibold animate-fade-in ${type === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}
      style={{ minWidth: 260 }}>
      {type === "success" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 text-xl text-gray-400 hover:text-gray-700">×</button>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({ full_name: "", phone: "", address: "", language: "en" });
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
    } catch (err: any) {
      userError = err.response?.data?.email?.[0] || "User update failed.";
    }
    try {
      // Update company profile
      await api.patch("accounts/company/me/", {
        company_name: editData.company_name,
        manager_full_name: editData.full_name,
        phone: editData.phone,
        address: editData.address,
      });
    } catch (err: any) {
      companyError = err.response?.data?.detail || "Company update failed.";
    }
    if (!userError && !companyError) {
      setAlert({ type: "success", msg: "Profile updated successfully!" });
      // Refresh user info
      const res = await api.get("auth/users/me/");
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
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
      await api.patch("auth/users/me/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setAlert({ type: "success", msg: "Profile photo updated!" });
      const res = await api.get("auth/users/me/");
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
    } catch {
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
    } catch (err: any) {
      setPwAlert({ type: "error", msg: err.response?.data?.current_password?.[0] || "Password change failed." });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 relative overflow-hidden py-10">
      {/* Decorative blurred circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-40 z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 z-0" />
      {/* Floating Alerts */}
      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
      {pwAlert && <FloatingAlert type={pwAlert.type} msg={pwAlert.msg} onClose={() => setPwAlert(null)} />}
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl p-0 md:p-0 relative z-10 backdrop-blur-xl border border-blue-100 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-56 bg-blue-50 border-r border-blue-100 flex md:flex-col flex-row md:items-start items-center md:gap-0 gap-2 p-4 md:p-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full md:w-auto text-blue-700 font-semibold transition-colors mb-2 md:mb-0 md:mt-2 md:mr-0 mr-2 ${activeTab === tab.key ? "bg-blue-100 shadow" : "hover:bg-blue-100"}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg w-full md:w-auto text-red-600 font-bold transition-colors mt-4 hover:bg-red-50 border border-red-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          {activeTab === "profile" && (
            <div>
              <h2 className="font-extrabold text-2xl text-blue-700 mb-8 tracking-tight">Profile Information</h2>
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                {/* Profile Photo */}
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-2">
                    <img
                      src={user?.profile_photo || "/assets/images.png"}
                      alt="Profile"
                      className="w-28 h-28 rounded-full border-2 border-blue-300 object-cover shadow-lg"
                    />
                    <button
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 shadow hover:bg-blue-700 border-2 border-white"
                      onClick={() => fileInput.current?.click()}
                      title="Upload photo"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInput}
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <div className="font-bold text-lg text-blue-700 mt-2">{user?.full_name || user?.manager_full_name || user?.fullName || "-"}</div>
                  <div className="text-gray-500 text-sm">{user?.email}</div>
                  <div className="text-gray-500 text-sm">{user?.phone || user?.mobile || "-"}</div>
                  <div className="text-xs mt-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">{user?.role || (user?.manager_full_name ? "Manager" : "Driver")}</div>
                  <div className="text-xs text-gray-400 mt-1">Joined: {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "-"}</div>
                </div>
                {/* Editable Form */}
                <form className="flex-1 space-y-6 w-full max-w-md" onSubmit={handleEditSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={safe(editData.full_name)}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 placeholder:text-blue-300 text-blue-900 text-base shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={safe(editData.phone)}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 placeholder:text-blue-300 text-blue-900 text-base shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={safe(editData.address)}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 placeholder:text-blue-300 text-blue-900 text-base shadow-sm"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                    <select
                      name="language"
                      value={safe(editData.language)}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-blue-900 text-base shadow-sm"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer mt-2 text-lg"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === "security" && (
            <div>
              <h2 className="font-extrabold text-2xl text-blue-700 mb-8 tracking-tight">Security Settings</h2>
              <form className="space-y-6 max-w-md" onSubmit={handlePasswordChange}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                  <input type="password" name="current" className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-blue-900 text-base shadow-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                  <input type="password" name="new" className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-blue-900 text-base shadow-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" name="confirm" className="w-full border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-blue-900 text-base shadow-sm" required />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer mt-2 text-lg"
                  disabled={pwLoading}
                >
                  {pwLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
          {activeTab === "notifications" && (
            <div>
              <h2 className="font-extrabold text-2xl text-blue-700 mb-8 tracking-tight">Notifications</h2>
              <div className="flex flex-col gap-6 max-w-md">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notif} onChange={handleNotifToggle} className="accent-blue-600 w-5 h-5" />
                  <span className="text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={twoFA} onChange={handle2FAToggle} className="accent-blue-600 w-5 h-5" />
                  <span className="text-gray-700">2FA (Two-Factor Auth)</span>
                </label>
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