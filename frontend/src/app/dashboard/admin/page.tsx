"use client";
import { useEffect, useState } from "react";
import api from "../../api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MessageSquare, 
  Users as UsersIcon, 
  Truck, 
  Shield,
  Settings,
  BarChart3,
  Activity,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Zap,
  Crown,
  Star,
  Award,
  Target,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Upload,
  Archive,
  Lock,
  Unlock,
  Key,
  CreditCard,
  DollarSign,
  Package,
  Car,
  Route,
  Fuel,
  Gauge,
  Timer,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  Folder,
  Image as ImageIcon,
  Video,
  Music,
  File,
  FolderOpen,
  Grid,
  List,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus as PlusIcon,
  X,
  Check,
  RotateCcw,
  Save,
  Send,
  Reply,
  Forward,
  Copy,
  Link,
  Unlink,
  ExternalLink,
  Maximize,
  Minimize,
  Move,
  Crop,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  Hash,
  AtSign,
  Percent,
  User as UserIcon
} from "lucide-react";

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
  password?: string;
  status: "active" | "inactive" | "suspended";
  last_login?: string;
  login_count?: number;
  role: "superadmin" | "admin" | "manager" | "user";
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  unreadMessages: number;
  totalDrivers: number;
  activeDrivers: number;
  systemHealth: number;
  storageUsed: number;
  storageTotal: number;
  uptime: number;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
}

interface SystemAlert {
  id: number;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const emptyUser: Partial<User> = {
  username: "",
  email: "",
  full_name: "",
  phone: "",
  company_name: "",
  is_staff: false,
  status: "active",
  role: "user",
};

// Enhanced dummy data
const dummyMessages = [
  { id: 1, name: "Ali Rezaei", email: "ali@email.com", message: "Hello, I have a question about the new features...", date: "2024-06-01", replied: false, status: "pending" },
  { id: 2, name: "Sara Karimi", email: "sara@email.com", message: "Thank you for your excellent services!", date: "2024-06-02", replied: true, status: "answered" },
  { id: 3, name: "Mohammad Ahmadi", email: "mohammad@email.com", message: "I need help with my account settings...", date: "2024-06-03", replied: false, status: "pending" },
];

const dummyDrivers = [
  { id: 1, name: "Reza Mohammadi", phone: "09120000001", status: "Active", vehicle: "12A345-IR", rating: 4.8 },
  { id: 2, name: "Mehdi Ahmadi", phone: "09120000002", status: "Inactive", vehicle: "22B456-IR", rating: 4.2 },
  { id: 3, name: "Fatemeh Yousefi", phone: "09120000003", status: "Active", vehicle: "33C567-IR", rating: 4.9 },
];

const systemStats: SystemStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalMessages: 156,
  unreadMessages: 23,
  totalDrivers: 89,
  activeDrivers: 67,
  systemHealth: 98,
  storageUsed: 75,
  storageTotal: 100,
  uptime: 99.9,
};

const activityLogs: ActivityLog[] = [
  { id: 1, user: "admin@pathnio.com", action: "User Created", details: "Created new user: ali@company.com", timestamp: "2024-06-01T10:30:00Z", ip_address: "192.168.1.100", user_agent: "Chrome/120.0" },
  { id: 2, user: "admin@pathnio.com", action: "System Backup", details: "Automatic backup completed successfully", timestamp: "2024-06-01T09:00:00Z", ip_address: "192.168.1.100", user_agent: "System" },
  { id: 3, user: "manager@pathnio.com", action: "Driver Updated", details: "Updated driver profile: Reza Mohammadi", timestamp: "2024-06-01T08:45:00Z", ip_address: "192.168.1.101", user_agent: "Firefox/119.0" },
];

const systemAlerts: SystemAlert[] = [
  { id: 1, type: "info", title: "System Update", message: "New version 2.1.0 is available for deployment", timestamp: "2024-06-01T10:00:00Z", read: false },
  { id: 2, type: "warning", title: "Storage Warning", message: "Storage usage is at 75%. Consider cleanup.", timestamp: "2024-06-01T09:30:00Z", read: true },
  { id: 3, type: "success", title: "Backup Complete", message: "Daily backup completed successfully", timestamp: "2024-06-01T08:00:00Z", read: true },
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'messages' | 'drivers' | 'analytics' | 'system' | 'logs'>('dashboard');
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [alerts, setAlerts] = useState<SystemAlert[]>(systemAlerts);
  const [unreadAlerts, setUnreadAlerts] = useState(systemAlerts.filter(a => !a.read).length);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 text-lg">Manage your Pathnio system and users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
                <Bell className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">{unreadAlerts} Alerts</span>
              </div>
              <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200">
                <Settings className="w-5 h-5 text-gray-600" />
        </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
              { id: 'users', label: 'Users', icon: UsersIcon, color: 'from-green-500 to-emerald-600' },
              { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'from-purple-500 to-pink-600' },
              { id: 'drivers', label: 'Drivers', icon: Truck, color: 'from-orange-500 to-red-600' },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
              { id: 'system', label: 'System', icon: Server, color: 'from-gray-500 to-slate-600' },
              { id: 'logs', label: 'Activity Logs', icon: Activity, color: 'from-yellow-500 to-amber-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
        <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
        </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Users", value: systemStats.totalUsers, icon: UsersIcon, color: "from-blue-500 to-indigo-600", change: "+12%" },
                { label: "Active Users", value: systemStats.activeUsers, icon: CheckCircle, color: "from-green-500 to-emerald-600", change: "+8%" },
                { label: "Total Messages", value: systemStats.totalMessages, icon: MessageSquare, color: "from-purple-500 to-pink-600", change: "+15%" },
                { label: "System Health", value: `${systemStats.systemHealth}%`, icon: Shield, color: "from-orange-500 to-red-600", change: "+2%" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </div>
                );
              })}
      </div>

            {/* System Alerts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-red-500" />
                System Alerts
              </h2>
              <div className="space-y-4">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      alert.type === 'error' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      alert.type === 'success' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.message}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-500" />
              Received Messages
            </h2>
          {messagesLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <div className="text-gray-600">Loading messages...</div>
              </div>
          ) : messagesError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <div className="text-red-600 font-semibold">{messagesError}</div>
              </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {messages.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No messages found</h3>
                    <p className="text-gray-500">No messages have been received yet</p>
                  </div>
                ) : messages.map(msg => (
                  <div key={msg.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => { setSelectedMessage(msg); setReply(""); setReplyError(""); setReplySuccess(false); }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900">{msg.name}</span>
                      <span className="text-xs text-gray-500">{msg.created_at ? new Date(msg.created_at).toLocaleDateString("fa-IR") : ""}</span>
                    </div>
                    <div className="text-gray-700 mb-3 break-words overflow-hidden line-clamp-3">{msg.message}</div>
                    <div className="text-xs text-gray-500 mb-2">{msg.email}</div>
                  <div className="mt-2">
                      {msg.status === 'answered' ? 
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Answered
                        </span> : 
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          Pending Reply
                        </span>
                      }
                    </div>
                </div>
              ))}
            </div>
          )}
          {/* Message Modal */}
          {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full p-8 relative">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors" onClick={() => setSelectedMessage(null)}>&times;</button>
                <div className="mb-4">
                    <div className="font-bold text-gray-900 text-lg">{selectedMessage.name}</div>
                  <div className="text-gray-500 text-sm">{selectedMessage.email}</div>
                  <div className="text-gray-700 mt-4 border-t pt-4 break-words overflow-hidden max-h-40 overflow-y-auto">{selectedMessage.message}</div>
                  <div className="text-xs text-gray-400 mt-2">{selectedMessage.subject}</div>
                  <div className="mt-2">
                      {selectedMessage.status === 'answered' ? 
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Answered
                        </span> : 
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          Pending Reply
                        </span>
                      }
                    </div>
                </div>
                {selectedMessage.status !== 'answered' && (
                  <form onSubmit={e => { e.preventDefault(); handleReply(selectedMessage.id); }} className="space-y-4 mt-6">
                      <textarea className="w-full rounded-2xl border-2 border-purple-200 p-4 focus:ring-2 focus:ring-purple-300 bg-white" rows={3} placeholder="Write your reply..." value={reply} onChange={e => setReply(e.target.value)} />
                    {replyError && <div className="text-red-500 text-sm font-bold">{replyError}</div>}
                      <button type="submit" className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300" disabled={replyLoading}>
                        {replyLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Reply
                          </div>
                        )}
                      </button>
                  </form>
                )}
                {selectedMessage.status === 'answered' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4 text-green-700 font-bold">This message has already been answered.</div>
                )}
                  {replySuccess && <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4 text-green-700 font-bold">Reply sent successfully.</div>}
                </div>
            </div>
          )}
        </div>
      )}

      {/* Drivers Section */}
      {activeTab === 'drivers' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-orange-500" />
              Drivers Management
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyDrivers.map(driver => (
                <div key={driver.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      driver.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {driver.status}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg mb-2">{driver.name}</div>
                  <div className="text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {driver.phone}
                  </div>
                  <div className="text-gray-700 mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-500" />
                    {driver.vehicle}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{driver.rating} Rating</span>
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Analytics Section */}
        {activeTab === 'analytics' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              Analytics Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "User Growth", value: "+15%", icon: TrendingUp, color: "from-green-500 to-emerald-600" },
                { label: "Message Volume", value: "+23%", icon: MessageSquare, color: "from-blue-500 to-indigo-600" },
                { label: "System Performance", value: "98.5%", icon: Zap, color: "from-yellow-500 to-orange-600" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-200">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* System Section */}
        {activeTab === 'system' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Server className="w-6 h-6 text-gray-500" />
              System Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "CPU Usage", value: "45%", icon: Cpu, color: "from-blue-500 to-indigo-600" },
                { label: "Memory Usage", value: "67%", icon: Database, color: "from-green-500 to-emerald-600" },
                { label: "Storage Used", value: `${systemStats.storageUsed}%`, icon: HardDrive, color: "from-purple-500 to-pink-600" },
                { label: "Network Status", value: "Online", icon: Wifi, color: "from-green-500 to-emerald-600" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-200">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Logs Section */}
        {activeTab === 'logs' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-yellow-500" />
              Activity Logs
            </h2>
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-3xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{log.user}</div>
                        <div className="text-sm text-gray-600">{log.action}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                  <div className="text-gray-700 mb-2">{log.details}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>IP: {log.ip_address}</span>
                    <span>Browser: {log.user_agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 