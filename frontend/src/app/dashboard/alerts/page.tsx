"use client";
import { useState, useMemo } from "react";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Filter,
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
  StarOff
} from "lucide-react";

const FAKE_ALERTS = [
  { 
    id: 1,
    type: "info", 
    title: "System Update Available", 
    desc: "A new version of the Pathnio app is available with enhanced features and security improvements.", 
    time: "2 min ago",
    read: false,
    priority: "low",
    category: "system"
  },
  { 
    id: 2,
    type: "success", 
    title: "Payment Successfully Processed", 
    desc: "Your monthly subscription payment of ₺2,500 has been successfully processed.", 
    time: "10 min ago",
    read: false,
    priority: "medium",
    category: "payment"
  },
  { 
    id: 3,
    type: "warning", 
    title: "Driver Delay Alert", 
    desc: "Driver Mohammad Ahmadi is running 15 minutes late for scheduled trip #23 to Tehran.", 
    time: "30 min ago",
    read: true,
    priority: "high",
    category: "driver"
  },
  { 
    id: 4,
    type: "error", 
    title: "Critical Vehicle Maintenance Required", 
    desc: "Truck 12A345-IR requires immediate maintenance. Engine temperature is above normal limits.", 
    time: "1 hour ago",
    read: false,
    priority: "critical",
    category: "vehicle"
  },
  { 
    id: 5,
    type: "info", 
    title: "New Support Message", 
    desc: "You have received a new message from our support team regarding your recent inquiry.", 
    time: "2 hours ago",
    read: true,
    priority: "low",
    category: "support"
  },
  { 
    id: 6,
    type: "success", 
    title: "Trip Successfully Completed", 
    desc: "Trip #45 from Tehran to Isfahan has been completed successfully with 98% customer satisfaction.", 
    time: "3 hours ago",
    read: true,
    priority: "medium",
    category: "trip"
  },
  { 
    id: 7,
    type: "warning", 
    title: "Driver License Expiry Warning", 
    desc: "Driver Sara Karimi's license will expire in 15 days. Please ensure renewal is completed.", 
    time: "Yesterday",
    read: false,
    priority: "high",
    category: "driver"
  },
  { 
    id: 8,
    type: "error", 
    title: "Security Alert - Failed Login Attempt", 
    desc: "Multiple failed login attempts detected from IP address 192.168.1.100. Account temporarily locked.", 
    time: "Yesterday",
    read: false,
    priority: "critical",
    category: "security"
  },
  { 
    id: 9,
    type: "success", 
    title: "Fuel Efficiency Milestone", 
    desc: "Your fleet achieved 15% improvement in fuel efficiency this month compared to last month.", 
    time: "2 days ago",
    read: true,
    priority: "medium",
    category: "performance"
  },
  { 
    id: 10,
    type: "info", 
    title: "Weather Alert", 
    desc: "Heavy rain expected in Tehran area. Consider route adjustments for today's deliveries.", 
    time: "3 days ago",
    read: true,
    priority: "low",
    category: "weather"
  }
];

const ICONS = {
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-yellow-100 text-yellow-600",
  critical: "bg-red-100 text-red-600",
};

const TYPE_COLORS = {
  info: "from-blue-50 to-blue-100 border-blue-200",
  success: "from-green-50 to-green-100 border-green-200",
  warning: "from-yellow-50 to-yellow-100 border-yellow-200",
  error: "from-red-50 to-red-100 border-red-200",
};

const CATEGORIES = [
  { id: "all", label: "All Alerts", count: FAKE_ALERTS.length },
  { id: "system", label: "System", count: FAKE_ALERTS.filter(a => a.category === "system").length },
  { id: "driver", label: "Driver", count: FAKE_ALERTS.filter(a => a.category === "driver").length },
  { id: "vehicle", label: "Vehicle", count: FAKE_ALERTS.filter(a => a.category === "vehicle").length },
  { id: "payment", label: "Payment", count: FAKE_ALERTS.filter(a => a.category === "payment").length },
  { id: "security", label: "Security", count: FAKE_ALERTS.filter(a => a.category === "security").length },
];

export default function AlertsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRead, setShowRead] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);

  const filteredAlerts = useMemo(() => {
    return FAKE_ALERTS.filter(alert => {
      const matchesCategory = selectedCategory === "all" || alert.category === selectedCategory;
      const matchesRead = showRead || !alert.read;
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRead && matchesSearch;
    });
  }, [selectedCategory, showRead, searchTerm]);

  const unreadCount = FAKE_ALERTS.filter(alert => !alert.read).length;

  const toggleAlertSelection = (alertId: number) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const markAsRead = (alertId: number) => {
    // In real app, this would update the backend
    console.log(`Marking alert ${alertId} as read`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Alerts & Notifications</h1>
                <p className="text-gray-600 text-lg">Stay informed about your fleet operations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-red-700">{unreadCount} Unread</span>
              </div>
              <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
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
            {CATEGORIES.map((category) => (
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

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`group relative bg-gradient-to-r ${TYPE_COLORS[alert.type]} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${
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
                    {ICONS[alert.type]}
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[alert.priority]}`}>
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
                    <p className="text-gray-700 mb-3 leading-relaxed">{alert.desc}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {alert.time}
                      </div>
                      <span className="capitalize">{alert.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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