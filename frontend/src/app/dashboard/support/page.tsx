'use client';
import { useEffect, useState } from 'react';
import api from '../../api';
import {
  MessageCircle,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  FileText,
  Phone,
  Mail,
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  Download,
  Archive,
  Tag,
  Calendar,
  User,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Video,
  Headphones,
  Shield,
  Zap,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'answered' | 'closed' | 'pending';
  message: string;
  reply?: string;
  created_at: string;
  updated_at: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assigned_to?: string;
}

const statusConfig = {
  open: {
    label: 'Open',
    color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-500',
  },
  answered: {
    label: 'Answered',
    color: 'text-green-700 bg-green-100 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700 bg-gray-100 border-gray-200',
    icon: XCircle,
    iconColor: 'text-gray-500',
  },
  pending: {
    label: 'Pending',
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    icon: Clock,
    iconColor: 'text-blue-500',
  },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-yellow-100 text-yellow-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

const categories = [
  { id: 'technical', label: 'Technical Issue', icon: Zap },
  { id: 'billing', label: 'Billing & Payment', icon: CreditCard },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'bug', label: 'Bug Report', icon: AlertCircle },
  { id: 'general', label: 'General Inquiry', icon: HelpCircle },
];

const quickActions = [
  {
    title: 'View Documentation',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Watch Tutorials',
    icon: Video,
    color: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Contact Sales',
    icon: Phone,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'System Status',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600',
  },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent'
  >('medium');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('accounts/support/tickets/');
      console.log('Tickets API response:', res.data);
      const ticketsData = Array.isArray(res.data)
        ? res.data
        : res.data.results || res.data.tickets || [];
      setTickets(ticketsData);
    } catch (err) {
      console.error('Tickets API error:', err);
      setError('Failed to load tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await api.post('accounts/support/tickets/', {
        subject,
        message,
        category,
        priority,
      });
      setSuccess('Your ticket has been submitted successfully!');
      setSubject('');
      setMessage('');
      setCategory('general');
      setPriority('medium');
      setShowForm(false);
      fetchTickets();
    } catch {
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openTickets = tickets.filter(
    (t) => t.status === 'open' || t.status === 'answered'
  ).length;
  const closedTickets = tickets.filter((t) => t.status === 'closed').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                <Headphones className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-0.5 lg:mb-1">
                  Support Center
                </h1>
                <p className="text-gray-600 text-xs lg:text-base">
                  Get help with your Pathnio account and services
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 lg:gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 bg-blue-100 rounded-full">
                <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                <span className="text-xs lg:text-sm font-semibold text-blue-700">
                  {openTickets} Open Tickets
                </span>
              </div>
              <button className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200">
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`bg-gradient-to-r ${action.color} text-white p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center gap-1.5 lg:gap-2`}
                >
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="text-xs lg:text-sm font-semibold text-center">
                    {action.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl border border-blue-200">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm lg:text-base">
                  Phone Support
                </div>
                <div className="text-gray-600 text-xs lg:text-sm">
                  +98 21 1234 5678
                </div>
                <div className="text-xs lg:text-sm text-gray-500">
                  Mon-Fri 9AM-6PM
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl lg:rounded-2xl border border-green-200">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm lg:text-base">
                  Email Support
                </div>
                <div className="text-gray-600 text-xs lg:text-sm">
                  support@pathnio.com
                </div>
                <div className="text-xs lg:text-sm text-gray-500">
                  24/7 Response
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl lg:rounded-2xl border border-purple-200">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm lg:text-base">
                  Office Address
                </div>
                <div className="text-gray-600 text-xs lg:text-sm">
                  Tehran, Iran
                </div>
                <div className="text-xs lg:text-sm text-gray-500">
                  Main Office
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Ticket */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Create New Ticket
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl lg:rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              {showForm ? 'Cancel' : 'New Ticket'}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 lg:space-y-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-blue-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 text-sm lg:text-base"
                  >
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 text-sm lg:text-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  maxLength={255}
                  placeholder="Brief description of your issue"
                  className="w-full border border-gray-200 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 text-sm lg:text-base"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Please provide detailed information about your issue..."
                  className="w-full border border-gray-200 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 resize-none text-sm lg:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 px-4 lg:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl lg:rounded-2xl transition-all duration-200 disabled:opacity-60 text-sm lg:text-base"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    Sending Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                    Submit Ticket
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-center gap-2 p-3 lg:p-4 bg-red-100 border border-red-200 rounded-xl lg:rounded-2xl text-red-700 text-sm lg:text-base">
                  <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 lg:p-4 bg-green-100 border border-green-200 rounded-xl lg:rounded-2xl text-green-700 text-sm lg:text-base">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  {success}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Tickets List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Your Tickets
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
              <div className="relative">
                <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 text-sm lg:text-base"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 lg:px-4 py-2 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 text-sm lg:text-base"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 lg:py-12">
              <RefreshCw className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 animate-spin mx-auto mb-3 lg:mb-4" />
              <div className="text-gray-600 text-sm lg:text-base">
                Loading tickets...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 lg:py-12">
              <AlertCircle className="w-10 h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-3 lg:mb-4" />
              <div className="text-red-600 font-semibold text-sm lg:text-base">
                {error}
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <MessageCircle className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 lg:mb-4" />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-600 mb-1 lg:mb-2">
                No tickets found
              </h3>
              <p className="text-gray-500 text-sm lg:text-base">
                Create your first support ticket to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              {filteredTickets.map((ticket) => {
                const status = statusConfig[ticket.status];
                const StatusIcon = status.icon;
                const priority = priorityConfig[ticket.priority || 'medium'];

                return (
                  <div
                    key={ticket.id}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4 mb-3 lg:mb-4">
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                        <div
                          className={`inline-flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-semibold border ${status.color}`}
                        >
                          <StatusIcon
                            className={`w-3 h-3 lg:w-4 lg:h-4 ${status.iconColor}`}
                          />
                          {status.label}
                        </div>
                        <span
                          className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-semibold ${priority.color}`}
                        >
                          {priority.label}
                        </span>
                      </div>
                      <div className="text-left lg:text-right">
                        <div className="text-xs lg:text-sm text-gray-500">
                          {formatDate(ticket.created_at)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ticket #{ticket.id}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-1 lg:mb-2">
                      {ticket.subject}
                    </h3>
                    <p className="text-gray-700 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base">
                      {ticket.message}
                    </p>

                    {ticket.reply && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl lg:rounded-2xl p-3 lg:p-4 mt-3 lg:mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-green-700 text-sm lg:text-base">
                              Support Team
                            </div>
                            <div className="text-xs text-green-600">
                              {formatDate(ticket.updated_at)}
                            </div>
                          </div>
                        </div>
                        <p className="text-green-800 leading-relaxed text-sm lg:text-base">
                          {ticket.reply}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
