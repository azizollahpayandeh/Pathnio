"use client";
import { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaRedo, FaShoppingCart, FaRegClock, FaChevronRight } from "react-icons/fa";

const fakeSubscriptions = [
  // برای تست حالت بدون اشتراک، آرایه را خالی بگذارید
  // {
  //   id: 1,
  //   plan: "Basic",
  //   status: "active",
  //   start: "2024-01-01",
  //   end: "2025-01-01",
  //   price: 4900000,
  // },
];

// تعریف type مناسب برای Plan
interface Plan {
  id: number;
  name: string;
  price: number;
  // سایر فیلدها در صورت نیاز
}

const plans: Plan[] = [
  {
    id: 1,
    name: "Basic",
    price: 4900000,
    desc: "For small teams and startups. 1 vehicle, 5 drivers.",
    features: ["1 Vehicle", "5 Drivers", "Basic Reports"],
  },
  {
    id: 2,
    name: "Pro",
    price: 9900000,
    desc: "For growing businesses. 5 vehicles, 20 drivers.",
    features: ["5 Vehicles", "20 Drivers", "Advanced Reports", "Priority Support"],
  },
  {
    id: 3,
    name: "Enterprise",
    price: 19900000,
    desc: "For large fleets. Unlimited vehicles and drivers.",
    features: ["Unlimited Vehicles", "Unlimited Drivers", "Custom Reports", "Dedicated Support"],
  },
];

const statusMap = {
  active: {
    label: "Active",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <FaCheckCircle className="text-green-500 mr-1" />,
  },
  expired: {
    label: "Expired",
    color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    icon: <FaRegClock className="text-yellow-500 mr-1" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <FaTimesCircle className="text-red-500 mr-1" />,
  },
};

export default function SubscriptionPage() {
  const [subs, setSubs] = useState(fakeSubscriptions);
  const [action, setAction] = useState<{type: string, id?: number} | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [payment, setPayment] = useState(false);

  const handleRenew = (id: number) => {
    setAction({type: "renew", id});
    setTimeout(() => {
      setSubs((prev) => prev.map(s => s.id === id ? { ...s, status: "active" } : s));
      setAction(null);
    }, 1200);
  };
  const handleCancel = (id: number) => {
    setAction({type: "cancel", id});
    setTimeout(() => {
      setSubs((prev) => prev.map(s => s.id === id ? { ...s, status: "cancelled" } : s));
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
          plan: selectedPlan?.name || "",
          status: "active",
          start: "2024-01-01",
          end: "2025-01-01",
          price: selectedPlan?.price || 0,
        },
      ]);
      setPayment(false);
      setShowPlans(false);
      setSelectedPlan(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl mx-auto mt-12 w-full animate-fade-in">
      <h1 className="font-extrabold text-4xl mb-10 text-blue-700 tracking-tight">Subscription</h1>
      {subs.length === 0 ? (
        showPlans ? (
          checkout && selectedPlan ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="text-2xl font-bold text-blue-800 mb-4">Checkout</div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 w-full max-w-md mb-6 shadow-lg">
                <div className="text-xl font-semibold mb-2">{selectedPlan.name} Plan</div>
                <div className="text-gray-700 mb-2">{selectedPlan.desc}</div>
                <ul className="mb-4 text-blue-700 list-disc list-inside">
                  {selectedPlan.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
                <div className="text-2xl font-bold text-blue-700 mb-2">{selectedPlan.price.toLocaleString()} Toman</div>
              </div>
              <button
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xl shadow-lg transition-all duration-200 cursor-pointer"
                onClick={handleCheckout}
                disabled={payment}
              >
                {payment ? (
                  <>
                    <FaShoppingCart className="animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    <FaChevronRight />
                    Go to Payment
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 py-10 animate-fade-in">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-8 flex flex-col items-center shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 cursor-pointer" onClick={() => handleSelectPlan(plan)}>
                  <div className="text-2xl font-bold text-blue-800 mb-2">{plan.name}</div>
                  <div className="text-gray-700 mb-2 text-center">{plan.desc}</div>
                  <ul className="mb-4 text-blue-700 list-disc list-inside text-sm">
                    {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                  <div className="text-2xl font-bold text-blue-700 mb-2">{plan.price.toLocaleString()} Toman</div>
                  <button className="mt-4 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow transition cursor-pointer">Select</button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FaShoppingCart className="text-blue-400 text-7xl mb-6 animate-bounce" />
            <div className="text-2xl font-semibold text-blue-800 mb-4">No active subscription</div>
            <button
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xl shadow-lg transition-all duration-200 cursor-pointer ${action?.type === "buy" ? "opacity-60 cursor-wait" : ""}`}
              onClick={handleBuy}
              disabled={action?.type === "buy"}
            >
              {action?.type === "buy" ? (
                <>
                  <FaShoppingCart className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  Buy Subscription
                </>
              )}
            </button>
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-xl border border-blue-100 text-lg">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-5 px-6 text-left font-bold">Plan</th>
                <th className="py-5 px-6 text-left font-bold">Status</th>
                <th className="py-5 px-6 text-left font-bold">Start</th>
                <th className="py-5 px-6 text-left font-bold">End</th>
                <th className="py-5 px-6 text-left font-bold">Price</th>
                <th className="py-5 px-6 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => (
                <tr key={sub.id} className="hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer">
                  <td className="py-5 px-6 font-semibold text-blue-800">{sub.plan}</td>
                  <td className={`py-5 px-6 font-semibold flex items-center ${statusMap[sub.status].color} rounded-lg w-fit border`}>{statusMap[sub.status].icon}{statusMap[sub.status].label}</td>
                  <td className="py-5 px-6 font-mono">{sub.start}</td>
                  <td className="py-5 px-6 font-mono">{sub.end}</td>
                  <td className="py-5 px-6 font-mono text-blue-700">{sub.price.toLocaleString()} Toman</td>
                  <td className="py-5 px-6 text-center flex gap-3 justify-center">
                    {sub.status !== "active" && (
                      <button
                        className={`flex items-center gap-1 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow transition text-base cursor-pointer ${action?.type === "renew" && action?.id === sub.id ? "opacity-60 cursor-wait" : ""}`}
                        onClick={() => handleRenew(sub.id)}
                        disabled={action?.type === "renew" && action?.id === sub.id}
                      >
                        <FaRedo />
                        {action?.type === "renew" && action?.id === sub.id ? "Renewing..." : "Renew"}
                      </button>
                    )}
                    {sub.status === "active" && (
                      <button
                        className={`flex items-center gap-1 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow transition text-base cursor-pointer ${action?.type === "cancel" && action?.id === sub.id ? "opacity-60 cursor-wait" : ""}`}
                        onClick={() => handleCancel(sub.id)}
                        disabled={action?.type === "cancel" && action?.id === sub.id}
                      >
                        <FaTimesCircle />
                        {action?.type === "cancel" && action?.id === sub.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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