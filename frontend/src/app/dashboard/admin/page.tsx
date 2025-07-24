"use client";
import { useEffect, useState } from "react";
import api from "../../api";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_manager: boolean;
  date_joined: string;
  profile_photo?: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
}

const emptyUser: Partial<User> = {
  username: "",
  email: "",
  full_name: "",
  phone: "",
  company_name: "",
  is_staff: false,
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState<"view" | "edit" | "add">("view");
  const [form, setForm] = useState<Partial<User>>(emptyUser);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("accounts/users/all/");
      setUsers(res.data);
    } catch (e) {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setForm(user);
    setEditMode("view");
    setShowModal(true);
  };

  const handleAddUser = () => {
    setForm(emptyUser);
    setEditMode("add");
    setShowModal(true);
  };

  const handleEdit = () => setEditMode("edit");
  const handleCancel = () => {
    setShowModal(false);
    setFormError("");
    setEditMode("view");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError("");
    try {
      if (editMode === "edit" && selectedUser) {
        await api.patch(`accounts/users/${selectedUser.id}/`, form);
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...form } as User : u));
        setEditMode("view");
      } else if (editMode === "add") {
        const res = await api.post("accounts/users/", form);
        setUsers([res.data, ...users]);
        setShowModal(false);
      }
    } catch (e: any) {
      setFormError(e?.response?.data?.detail || "Failed to save user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    setFormError("");
    try {
      await api.delete(`accounts/users/${selectedUser.id}/`);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowModal(false);
    } catch (e: any) {
      setFormError(e?.response?.data?.detail || "Failed to delete user.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-lg">Admin Dashboard</h1>
        <button
          className="px-6 py-2 rounded-xl font-bold text-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          onClick={handleAddUser}
        >
          + Add User
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="bg-blue-50 text-blue-800">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-blue-600 font-bold animate-pulse">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-gray-400">No users found.</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} className="border-b last:border-b-0 hover:bg-blue-50 transition cursor-pointer" onClick={() => handleUserClick(u)}>
                <td className="py-2 px-4 font-bold text-blue-900">{i + 1}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.is_superuser ? "Superadmin" : u.is_staff ? "Admin" : "User"}</td>
                <td className="py-2 px-4">{u.date_joined ? new Date(u.date_joined).toLocaleString("en-US") : "-"}</td>
                <td className="py-2 px-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold shadow">View</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* User Modal/Panel */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 max-w-lg w-full p-8 relative animate-fadein">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={handleCancel}>&times;</button>
            <div className="flex flex-col items-center gap-4 mb-6">
              <Image
                src={form.profile_photo || "/assets/images.png"}
                alt="Profile"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-4 border-blue-200 object-cover shadow-lg"
              />
              <div className="text-xl font-bold text-blue-800">{form.full_name || form.username}</div>
              <div className="text-gray-500">{form.email}</div>
              <div className="text-gray-400 text-sm">{form.company_name || "-"}</div>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="flex gap-4">
                <input type="text" name="full_name" value={form.full_name || ""} onChange={handleChange} placeholder="Full Name" className="flex-1 px-4 py-2 rounded-xl border border-blue-200 shadow focus:ring-2 focus:ring-blue-400" disabled={editMode === "view"} />
                <input type="text" name="username" value={form.username || ""} onChange={handleChange} placeholder="Username" className="flex-1 px-4 py-2 rounded-xl border border-blue-200 shadow focus:ring-2 focus:ring-blue-400" disabled={editMode === "view"} />
              </div>
              <input type="email" name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2 rounded-xl border border-blue-200 shadow focus:ring-2 focus:ring-blue-400" disabled={editMode === "view"} />
              <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Phone" className="w-full px-4 py-2 rounded-xl border border-blue-200 shadow focus:ring-2 focus:ring-blue-400" disabled={editMode === "view"} />
              <input type="text" name="company_name" value={form.company_name || ""} onChange={handleChange} placeholder="Company Name" className="w-full px-4 py-2 rounded-xl border border-blue-200 shadow focus:ring-2 focus:ring-blue-400" disabled={editMode === "view"} />
              {editMode !== "add" && (
                <input type="password" name="password" value={form.password || ""} onChange={handleChange} placeholder="New Password (leave blank to keep)" className="w-full px-4 py-2 rounded-xl border border-blue-200 shadow focus:ring-2 focus:ring-blue-400" disabled={editMode === "view"} />
              )}
              {formError && <div className="text-red-600 text-sm font-bold text-center mt-2">{formError}</div>}
              <div className="flex gap-4 justify-end mt-6">
                {editMode === "view" && (
                  <>
                    <button type="button" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition" onClick={handleEdit}>Edit</button>
                    <button type="button" className="px-5 py-2 rounded-xl bg-red-100 text-red-700 font-bold shadow hover:bg-red-200 transition" onClick={handleDelete}>Delete</button>
                  </>
                )}
                {(editMode === "edit" || editMode === "add") && (
                  <button type="submit" className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow hover:from-blue-700 hover:to-purple-700 transition" disabled={formLoading}>{formLoading ? "Saving..." : "Save"}</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fadein { animation: fadein 0.5s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadein { 0% { opacity: 0; transform: translateY(30px);} 100% { opacity: 1; transform: translateY(0);} }
      `}</style>
    </div>
  );
} 