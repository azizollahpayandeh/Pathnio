"use client";
import { useEffect, useState } from "react";
import api from "../../api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MessageSquare, Users as UsersIcon, Truck } from "lucide-react";

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
  password?: string; // For form handling
}

const emptyUser: Partial<User> = {
  username: "",
  email: "",
  full_name: "",
  phone: "",
  company_name: "",
  is_staff: false,
};

// Dummy data for messages and drivers
const dummyMessages = [
  { id: 1, name: "Ali", email: "ali@email.com", message: "Hello, I have a question...", date: "2024-06-01", replied: false },
  { id: 2, name: "Sara", email: "sara@email.com", message: "Thank you for your services!", date: "2024-06-02", replied: true },
];
const dummyDrivers = [
  { id: 1, name: "Reza Mohammadi", phone: "09120000001", status: "Active" },
  { id: 2, name: "Mehdi Ahmadi", phone: "09120000002", status: "Inactive" },
];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState<"view" | "edit" | "add">("view");
  const [form, setForm] = useState<Partial<User>>(emptyUser);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'drivers'>('users');
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch messages from backend
  useEffect(() => {
    if (activeTab === 'messages') {
      setMessagesLoading(true);
      setMessagesError("");
      api.get("accounts/admin/messages/")
        .then(res => {
          setMessages(res.data.contacts || []);
        })
        .catch(err => {
          setMessagesError(err?.response?.data?.detail || "Error loading messages");
        })
        .finally(() => setMessagesLoading(false));
    }
  }, [activeTab]);

  // Reply to message
  const handleReply = async (id: number) => {
    setReplyLoading(true);
    setReplyError("");
    setReplySuccess(false);
    try {
      await api.post(`accounts/support/tickets/${id}/reply/`, { reply });
      setReplySuccess(true);
      setReply("");
      setSelectedMessage(null);
      // Refresh messages
      setMessagesLoading(true);
      api.get("accounts/admin/messages/")
        .then(res => {
          setMessages(res.data.contacts || []);
        })
        .catch(() => {})
        .finally(() => setMessagesLoading(false));
    } catch (e: any) {
      setReplyError(e?.response?.data?.detail || "Error sending reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Admin - Fetching users...");
      const res = await api.get("accounts/users/all/");
      console.log("Admin - Fetched users:", res.data);
      console.log("Admin - Number of users:", res.data.length);
      setUsers(res.data);
    } catch (e) {
      console.error("Admin - Error fetching users:", e);
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
      console.log("Admin - handleSave called with editMode:", editMode);
      console.log("Admin - Form data:", form);
      
      if (editMode === "edit" && selectedUser) {
        // Update existing user
        console.log("Admin - Updating user:", selectedUser.id);
        const res = await api.patch(`accounts/users/${selectedUser.id}/`, form);
        console.log("Admin - Update response:", res.data);
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...res.data } as User : u));
        setEditMode("view");
      } else if (editMode === "add") {
        // Create new user
        console.log("Admin - Creating new user with data:", form);
        const res = await api.post("accounts/users/", form);
        console.log("Admin - Create response:", res.data);
        setUsers([res.data, ...users]);
        setShowModal(false);
        // Refresh the user list to make sure it's updated
        await fetchUsers();
      }
    } catch (e: any) {
      console.error("Admin - Error in handleSave:", e);
      console.error("Admin - Error response:", e?.response?.data);
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
      await api.delete(`accounts/users/${selectedUser.id}/delete/`);
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
      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-10">
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 focus:outline-none ${activeTab === 'users' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
          onClick={() => setActiveTab('users')}
        >
          <UsersIcon className="w-6 h-6" /> Users
        </button>
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 focus:outline-none ${activeTab === 'messages' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare className="w-6 h-6" /> Messages
        </button>
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 focus:outline-none ${activeTab === 'drivers' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
          onClick={() => setActiveTab('drivers')}
        >
          <Truck className="w-6 h-6" /> Drivers
        </button>
      </div>

      {/* Users Section */}
      {activeTab === 'users' && (
        <>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 max-w-2xl w-full p-8 relative animate-fadein overflow-y-auto max-h-[90vh]">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors" onClick={handleCancel}>&times;</button>
                
                {/* Header Section */}
                <div className="flex flex-col items-center gap-4 mb-8">
                  <Image
                    src={form.profile_photo || "/assets/images.png"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full border-4 border-blue-200 object-cover shadow-lg"
                  />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800 mb-1">{form.full_name || form.username || "New User"}</div>
                    <div className="text-gray-500 text-lg">{form.email || "No email"}</div>
                    <div className="text-gray-400 text-sm mt-1">{form.company_name || "No company"}</div>
                  </div>
                </div>

                {/* Form Section */}
                <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  {/* Required fields note */}
                  {editMode === "add" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="text-blue-700 text-sm font-medium">
                        <span className="text-red-500">*</span> Required fields
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        name="full_name" 
                        value={form.full_name || ""} 
                        onChange={handleChange} 
                        placeholder="Enter full name" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                        disabled={editMode === "view"} 
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="username" 
                        value={form.username || ""} 
                        onChange={handleChange} 
                        placeholder="Enter username" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                        disabled={editMode === "view"} 
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={form.email || ""} 
                        onChange={handleChange} 
                        placeholder="Enter email address" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                        disabled={editMode === "view"} 
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input 
                        type="text" 
                        name="phone" 
                        value={form.phone || ""} 
                        onChange={handleChange} 
                        placeholder="Enter phone number" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                        disabled={editMode === "view"} 
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                      <input 
                        type="text" 
                        name="company_name" 
                        value={form.company_name || ""} 
                        onChange={handleChange} 
                        placeholder="Enter company name" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                        disabled={editMode === "view"} 
                      />
                    </div>

                    {/* Password - Required for add mode, optional for edit mode */}
                    {editMode === "add" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="password" 
                          name="password" 
                          value={form.password || ""} 
                          onChange={handleChange} 
                          placeholder="Enter password" 
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                          required
                        />
                      </div>
                    )}

                    {/* Password - Only for edit mode */}
                    {editMode === "edit" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <input 
                          type="password" 
                          name="password" 
                          value={form.password || ""} 
                          onChange={handleChange} 
                          placeholder="Leave blank to keep current password" 
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {formError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="text-red-600 text-sm font-semibold text-center">{formError}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
                    {editMode === "view" && (
                      <>
                        <button 
                          type="button" 
                          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105" 
                          onClick={handleEdit}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          className="px-6 py-3 rounded-xl bg-red-100 text-red-700 font-bold shadow-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-105" 
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {(editMode === "edit" || editMode === "add") && (
                      <button 
                        type="submit" 
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105" 
                        disabled={formLoading}
                      >
                        {formLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Messages Section */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 animate-fadein">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6" /> Received Messages</h2>
          {messagesLoading ? (
            <div className="text-blue-600 font-bold animate-pulse py-8 text-center">Loading messages...</div>
          ) : messagesError ? (
            <div className="text-red-500 font-bold py-8 text-center">{messagesError}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {messages.length === 0 ? (
                <div className="col-span-2 text-gray-400 text-center">No messages found.</div>
              ) : messages.map(msg => (
                <div key={msg.id} className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 hover:shadow-2xl transition cursor-pointer" onClick={() => { setSelectedMessage(msg); setReply(""); setReplyError(""); setReplySuccess(false); }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-900">{msg.name}</span>
                    <span className="text-xs text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleDateString("en-US") : ""}</span>
                  </div>
                  <div className="text-gray-700 mb-2 break-words overflow-hidden line-clamp-3">{msg.message}</div>
                  <div className="text-xs text-gray-500">{msg.email}</div>
                  <div className="mt-2">
                    {msg.status === 'answered' ? <span className="text-green-600 font-bold">Answered</span> : <span className="text-red-500 font-bold">Pending Reply</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Message Modal */}
          {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 max-w-lg w-full p-8 relative animate-fadein">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors" onClick={() => setSelectedMessage(null)}>&times;</button>
                <div className="mb-4">
                  <div className="font-bold text-blue-900 text-lg">{selectedMessage.name}</div>
                  <div className="text-gray-500 text-sm">{selectedMessage.email}</div>
                  <div className="text-gray-700 mt-4 border-t pt-4 break-words overflow-hidden max-h-40 overflow-y-auto">{selectedMessage.message}</div>
                  <div className="text-xs text-gray-400 mt-2">{selectedMessage.subject}</div>
                  <div className="mt-2">
                    {selectedMessage.status === 'answered' ? <span className="text-green-600 font-bold">Answered</span> : <span className="text-red-500 font-bold">Pending Reply</span>}
                  </div>
                </div>
                {selectedMessage.status !== 'answered' && (
                  <form onSubmit={e => { e.preventDefault(); handleReply(selectedMessage.id); }} className="space-y-4 mt-6">
                    <textarea className="w-full rounded-xl border-2 border-blue-200 p-4 focus:ring-2 focus:ring-blue-300" rows={3} placeholder="Write your reply..." value={reply} onChange={e => setReply(e.target.value)} />
                    {replyError && <div className="text-red-500 text-sm font-bold">{replyError}</div>}
                    <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300" disabled={replyLoading}>{replyLoading ? 'Sending...' : 'Send Reply'}</button>
                  </form>
                )}
                {selectedMessage.status === 'answered' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 text-green-700 font-bold">This message has already been answered.</div>
                )}
                {replySuccess && <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 text-green-700 font-bold">Reply sent successfully.</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drivers Section */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 animate-fadein">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><Truck className="w-6 h-6" /> Drivers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {dummyDrivers.map(driver => (
              <div key={driver.id} className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 hover:shadow-2xl transition">
                <div className="font-bold text-blue-900 text-lg mb-2">{driver.name}</div>
                <div className="text-gray-700 mb-1">Phone: {driver.phone}</div>
                <div className="text-xs text-gray-500">Status: <span className={driver.status === 'Active' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{driver.status}</span></div>
              </div>
            ))}
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