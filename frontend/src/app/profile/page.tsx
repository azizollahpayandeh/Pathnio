"use client";
import React, { useRef, useState, useEffect } from "react";
import api from "../api";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
];
const TABS = [
  { key: "profile", label: "Profile Info", icon: "👤" },
  { key: "security", label: "Security", icon: "🔒" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
];

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
    try {
      await api.patch("auth/users/me/", {
        full_name: editData.full_name,
        phone: editData.phone,
        address: editData.address,
        language: editData.language,
      });
      setAlert({ type: "success", msg: "Profile updated successfully!" });
      const res = await api.get("auth/users/me/");
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
    } catch (err: any) {
      setAlert({ type: "error", msg: "Update failed. Please try again." });
    } finally {
      setLoading(false);
    }
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
    } catch {
      setPwAlert({ type: "error", msg: "Password change failed." });
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

  // Controlled input fix: always string
  const safe = (v: any) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

  return (
    <div className="flex flex-col md:flex-row max-w-4xl mx-auto bg-white rounded-xl shadow-lg mt-8 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-56 bg-blue-50 border-r border-blue-100 flex md:flex-col flex-row md:items-start items-center md:gap-0 gap-2 p-4 md:p-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full md:w-auto text-blue-700 font-medium transition-colors mb-2 md:mb-0 md:mt-2 md:mr-0 mr-2 ${activeTab === tab.key ? "bg-blue-100" : "hover:bg-blue-100"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {activeTab === "profile" && (
          <div>
            <h2 className="font-bold text-2xl text-blue-700 mb-6">Profile Information</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-2">
                  <img
                    src={user?.profile_photo || "/assets/images.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-2 border-blue-300 object-cover"
                  />
                  <button
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow hover:bg-blue-700"
                    onClick={() => fileInput.current?.click()}
                    title="Upload photo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
              <form className="flex-1 space-y-4 w-full max-w-md" onSubmit={handleEditSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={safe(editData.full_name)}
                    onChange={handleEditChange}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={safe(editData.phone)}
                    onChange={handleEditChange}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={safe(editData.address)}
                    onChange={handleEditChange}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    name="language"
                    value={safe(editData.language)}
                    onChange={handleEditChange}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                {alert && (
                  <div className={`text-sm rounded px-3 py-2 mt-2 ${alert.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{alert.msg}</div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === "security" && (
          <div>
            <h2 className="font-bold text-2xl text-blue-700 mb-6">Security Settings</h2>
            <form className="space-y-4 max-w-md" onSubmit={handlePasswordChange}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" name="current" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" name="new" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" name="confirm" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400" required />
              </div>
              {pwAlert && (
                <div className={`text-sm rounded px-3 py-2 ${pwAlert.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{pwAlert.msg}</div>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                disabled={pwLoading}
              >
                {pwLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
        {activeTab === "notifications" && (
          <div>
            <h2 className="font-bold text-2xl text-blue-700 mb-6">Notifications</h2>
            <div className="flex flex-col gap-4 max-w-md">
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
  );
} 