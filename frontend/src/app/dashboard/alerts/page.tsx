"use client";
import { useState, useEffect, useMemo } from "react";
import api from "../../api";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Search,
  Clock,
  Eye,
  EyeOff,
  MoreVertical,
  RefreshCw,
  Settings,
  Trash2,
  Archive,
  Star,
  User,
  LogIn,
  LogOut,
  Lock,
  UserCheck,
  Shield,
} from "lucide-react";

interface Alert {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

const ICONS = {
  login: <LogIn className="w-5 h-5 text-green-500" />,
  logout: <LogOut className="w-5 h-5 text-blue-500" />,
  password_change: <Lock className="w-5 h-5 text-yellow-500" />,
  profile_update: <User className="w-5 h-5 text-blue-500" />,
  user_created: <UserCheck className="w-5 h-5 text-green-500" />,
  user_updated: <User className="w-5 h-5 text-blue-500" />,
  user_deleted: <XCircle className="w-5 h-5 text-red-500" />,
  security_issue: <Shield className="w-5 h-5 text-red-500" />,
  failed_login: <XCircle className="w-5 h-5 text-red-500" />,
  account_locked: <Lock className="w-5 h-5 text-red-500" />,
  system: <Info className="w-5 h-5 text-blue-500" />,
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-yellow-100 text-yellow-600",
  critical: "bg-red-100 text-red-600",
};

const TYPE_COLORS = {
  login: "from-green-50 to-green-100 border-green-200",
  logout: "from-blue-50 to-blue-100 border-blue-200",
  password_change: "from-yellow-50 to-yellow-100 border-yellow-200",
  profile_update: "from-blue-50 to-blue-100 border-blue-200",
  user_created: "from-green-50 to-green-100 border-green-200",
  user_updated: "from-blue-50 to-blue-100 border-blue-200",
  user_deleted: "from-red-50 to-red-100 border-red-200",
  security_issue: "from-red-50 to-red-100 border-red-200",
  failed_login: "from-red-50 to-red-100 border-red-200",
  account_locked: "from-red-50 to-red-100 border-red-200",
  system: "from-blue-50 to-blue-100 border-blue-200",
};

// This will be updated dynamically based on actual alerts
const getCategories = (alerts: Alert[]) => [
  { id: "all", label: "All Alerts", count: alerts.length },
  { id: "login", label: "Login", count: alerts.filter(a => a.alert_type === "login").length },
  { id: "logout", label: "Logout", count: alerts.filter(a => a.alert_type === "logout").length },
  { id: "password_change", label: "Password", count: alerts.filter(a => a.alert_type === "password_change").length },
  { id: "profile_update", label: "Profile", count: alerts.filter(a => a.alert_type === "profile_update").length },
  { id: "user_created", label: "User Created", count: alerts.filter(a => a.alert_type === "user_created").length },
  { id: "failed_login", label: "Security", count: alerts.filter(a => a.alert_type === "failed_login" || a.alert_type === "security_issue").length },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRead, setShowRead] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('accounts/alerts/');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = getCategories(alerts);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesCategory = selectedCategory === "all" || alert.alert_type === selectedCategory;
      const matchesRead = showRead || !alert.read;
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRead && matchesSearch;
    });
  }, [alerts, selectedCategory, showRead, searchTerm]);

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const toggleAlertSelection = (alertId: number) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const markAsRead = async (alertId: number) => {
    try {
      await api.patch(`accounts/alerts/${alertId}/`);
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">Alerts & Notifications</h1>
                <p className="text-gray-600 text-sm lg:text-lg">Stay informed about your fleet operations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-red-100 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs lg:text-sm font-semibold text-red-700">{unreadCount} Unread</span>
              </div>
              <button 
                onClick={fetchAlerts}
                className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRead(!showRead)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  showRead 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showRead ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showRead ? 'Show All' : 'Unread Only'}
              </button>
              <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <span>{category.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredAlerts.length} Alert{filteredAlerts.length !== 1 ? 's' : ''}
            </h2>
            {selectedAlerts.length > 0 && (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors">
                  <Archive className="w-4 h-4" />
                  Archive Selected
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 bg-gray-200 rounded mt-2"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded mt-1"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`group relative bg-gradient-to-r ${TYPE_COLORS[alert.alert_type as keyof typeof TYPE_COLORS] || TYPE_COLORS.system} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${
                    !alert.read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => toggleAlertSelection(alert.id)}
                      className="mt-2 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {ICONS[alert.alert_type as keyof typeof ICONS] || ICONS.system}
                    </div>

                    {/* Content */}
                  <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className={`font-bold text-lg ${!alert.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              New
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[alert.priority as keyof typeof PRIORITY_COLORS]}`}>
                            {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                            <Star className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(alert.timestamp)}
                        </div>
                        <span className="capitalize">{alert.alert_type.replace('_', ' ')}</span>
                        {alert.ip_address && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">IP: {alert.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No alerts found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
