'use client';
import { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Users,
  Car,
  BarChart3,
  Headphones,
  Globe,
  Calendar,
  TrendingUp,
  Award,
  Crown,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Database,
  Lock,
  Bell,
  Gift,
} from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  desc: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  icon: React.ElementType;
  color: string;
  gradient: string;
  badge?: string;
}

interface Subscription {
  id: number;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  start: string;
  end: string;
  price: number;
  nextBilling?: string;
  autoRenew?: boolean;
}

const plans: Plan[] = [
  {
    id: 1,
    name: 'Starter',
    price: 4900000,
    originalPrice: 5900000,
    desc: 'Perfect for small teams and startups',
    features: [
      'Up to 3 Vehicles',
      'Up to 10 Drivers',
      'Basic Analytics & Reports',
      'Email Support',
      'Mobile App Access',
      'Basic Route Optimization',
    ],
    icon: Car,
    color: 'from-blue-500 to-indigo-600',
    gradient: 'from-blue-50 to-indigo-50',
    badge: 'Most Popular',
  },
  {
    id: 2,
    name: 'Professional',
    price: 9900000,
    originalPrice: 11900000,
    desc: 'Ideal for growing businesses',
    features: [
      'Up to 15 Vehicles',
      'Up to 50 Drivers',
      'Advanced Analytics & Reports',
      'Priority Support',
      'Custom Integrations',
      'Advanced Route Optimization',
      'Driver Performance Tracking',
      'Fuel Management',
    ],
    popular: true,
    recommended: true,
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    gradient: 'from-purple-50 to-pink-50',
    badge: 'Recommended',
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 19900000,
    originalPrice: 24900000,
    desc: 'For large fleets and corporations',
    features: [
      'Unlimited Vehicles',
      'Unlimited Drivers',
      'Custom Analytics & Reports',
      '24/7 Dedicated Support',
      'API Access',
      'Advanced AI Features',
      'White-label Solutions',
      'Custom Development',
      'On-premise Deployment',
      'SLA Guarantee',
    ],
    icon: Crown,
    color: 'from-orange-500 to-red-600',
    gradient: 'from-orange-50 to-red-50',
    badge: 'Enterprise',
  },
];

const fakeSubscriptions: Subscription[] = [
  {
    id: 1,
    plan: 'Professional',
    status: 'active',
    start: '2024-01-01',
    end: '2025-01-01',
    price: 9900000,
    nextBilling: '2025-01-01',
    autoRenew: true,
  },
];

const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-green-700 bg-green-100 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  expired: {
    label: 'Expired',
    color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700 bg-red-100 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  pending: {
    label: 'Pending',
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    icon: Clock,
    iconColor: 'text-blue-500',
  },
};

export default function SubscriptionPage() {
  const [subs, setSubs] = useState<Subscription[]>(fakeSubscriptions);
  const [action, setAction] = useState<{ type: string; id?: number } | null>(
    null
  );
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [payment, setPayment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleRenew = (id: number) => {
    setAction({ type: 'renew', id });
    setTimeout(() => {
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'active' } : s))
      );
      setAction(null);
    }, 1200);
  };

  const handleCancel = (id: number) => {
    setAction({ type: 'cancel', id });
    setTimeout(() => {
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s))
      );
      setAction(null);
    }, 1200);
  };

  const handleBuy = () => {
    setShowPlans(true);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setTimeout(() => setCheckout(true), 400);
  };

  const handleCheckout = () => {
    setCheckout(false);
    setPayment(true);
    setTimeout(() => {
      setSubs([
        {
          id: 1,
          plan: selectedPlan?.name || '',
          status: 'active',
          start: '2024-01-01',
          end: '2025-01-01',
          price: selectedPlan?.price || 0,
          nextBilling: '2025-01-01',
          autoRenew: true,
        },
      ]);
      setPayment(false);
      setShowPlans(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">
                  Subscription Management
                </h1>
                <p className="text-gray-600 text-sm lg:text-lg">
                  Manage your Pathnio subscription and billing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-green-100 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs lg:text-sm font-semibold text-green-700">
                  Active Plan
                </span>
              </div>
              <button className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200">
                <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Current Plan Summary */}
          {subs.length > 0 && subs[0].status === 'active' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {subs[0].plan} Plan
                    </h3>
                    <p className="text-gray-600">Active until {subs[0].end}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(subs[0].price)} تومان
                  </div>
                  <div className="text-sm text-gray-600">
                    Next billing: {subs[0].nextBilling}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {subs.length === 0 ? (
          showPlans ? (
            checkout && selectedPlan ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Complete Your Purchase
                    </h2>
                    <p className="text-gray-600">
                      Review your plan details and proceed to payment
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${selectedPlan.color} rounded-3xl flex items-center justify-center`}
                        >
                          <selectedPlan.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedPlan.name} Plan
                          </h3>
                          <p className="text-gray-600">{selectedPlan.desc}</p>
                        </div>
                      </div>
                      {selectedPlan.originalPrice && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(selectedPlan.originalPrice)} تومان
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(selectedPlan.price)} تومان
                          </div>
                          <div className="text-sm text-green-600 font-semibold">
                            Save{' '}
                            {formatPrice(
                              selectedPlan.originalPrice - selectedPlan.price
                            )}{' '}
                            تومان
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl shadow-lg transition-all duration-200 disabled:opacity-60"
                    onClick={handleCheckout}
                    disabled={payment}
                  >
                    {payment ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Redirecting to payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Proceed to Payment
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Plans Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Choose Your Plan
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Select the perfect plan for your fleet management needs. All
                    plans include our core features with different capacity
                    limits.
                  </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <div
                        key={plan.id}
                        className={`relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                          plan.popular ? 'ring-2 ring-purple-200' : ''
                        }`}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {plan.badge && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold rounded-full shadow-lg">
                              {plan.badge}
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-6">
                          <div
                            className={`w-20 h-20 bg-gradient-to-br ${plan.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                          >
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {plan.name}
                          </h3>
                          <p className="text-gray-600 mb-4">{plan.desc}</p>

                          <div className="mb-6">
                            {plan.originalPrice && (
                              <div className="text-sm text-gray-500 line-through mb-1">
                                {formatPrice(plan.originalPrice)} تومان
                              </div>
                            )}
                            <div className="text-3xl font-bold text-gray-900">
                              {formatPrice(plan.price)} تومان
                            </div>
                            <div className="text-sm text-gray-600">
                              per year
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-8">
                          {plan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2">
                          Select Plan
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  No Active Subscription
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Get started with Pathnio to unlock powerful fleet management
                  features and analytics.
                </p>
                <button
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl shadow-lg transition-all duration-200 mx-auto"
                  onClick={handleBuy}
                  disabled={action?.type === 'buy'}
                >
                  {action?.type === 'buy' ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Choose a Plan
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-8">
            {/* Current Subscription Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Current Subscription
                </h2>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors">
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    <Settings className="w-4 h-4" />
                    Manage Billing
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {subs.map((sub) => {
                  const status = statusConfig[sub.status];
                  const StatusIcon = status.icon;
                  const daysRemaining = getDaysRemaining(sub.end);

                  return (
                    <div
                      key={sub.id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {sub.plan} Plan
                            </h3>
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${status.color}`}
                            >
                              <StatusIcon
                                className={`w-4 h-4 ${status.iconColor}`}
                              />
                              {status.label}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(sub.price)} تومان
                          </div>
                          <div className="text-sm text-gray-600">per year</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Start Date
                          </div>
                          <div className="font-semibold text-gray-900">
                            {sub.start}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            End Date
                          </div>
                          <div className="font-semibold text-gray-900">
                            {sub.end}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Days Remaining
                          </div>
                          <div className="font-semibold text-gray-900">
                            {daysRemaining} days
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Auto Renew
                          </div>
                          <div className="font-semibold text-gray-900">
                            {sub.autoRenew ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.status !== 'active' && (
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
                            onClick={() => handleRenew(sub.id)}
                            disabled={
                              action?.type === 'renew' && action?.id === sub.id
                            }
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                action?.type === 'renew' &&
                                action?.id === sub.id
                                  ? 'animate-spin'
                                  : ''
                              }`}
                            />
                            {action?.type === 'renew' && action?.id === sub.id
                              ? 'Renewing...'
                              : 'Renew'}
                          </button>
                        )}
                        {sub.status === 'active' && (
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                            onClick={() => handleCancel(sub.id)}
                            disabled={
                              action?.type === 'cancel' && action?.id === sub.id
                            }
                          >
                            <XCircle className="w-4 h-4" />
                            {action?.type === 'cancel' && action?.id === sub.id
                              ? 'Cancelling...'
                              : 'Cancel'}
                          </button>
                        )}
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors">
                          <Settings className="w-4 h-4" />
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
