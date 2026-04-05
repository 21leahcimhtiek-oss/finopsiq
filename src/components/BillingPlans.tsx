"use client";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    description: "For small teams",
    features: ["3 cloud accounts", "6-month history", "CSV upload", "Basic alerts", "5 members"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 249,
    description: "AI-powered insights",
    features: ["15 cloud accounts", "18-month history", "AI anomaly detection", "ML forecasting", "Slack alerts", "25 members"],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 599,
    description: "Unlimited scale",
    features: ["Unlimited accounts", "36-month history", "AI recommendations", "Chargeback reports", "SSO", "Unlimited members"],
  },
];

export default function BillingPlans({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {PLANS.map((plan) => (
        <div key={plan.id} className={clsx("rounded-xl border-2 p-5 transition-all", plan.highlight ? "border-blue-500 shadow-lg shadow-blue-50" : "border-gray-200")}>
          {plan.highlight && <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Most Popular</div>}
          <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
          <p className="text-gray-500 text-sm mb-3">{plan.description}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
            <span className="text-gray-500 text-sm">/mo</span>
          </div>
          <ul className="space-y-2 mb-5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade(plan.id)}
            disabled={plan.id === currentPlan || loading !== null}
            className={clsx(
              "w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors",
              plan.id === currentPlan
                ? "bg-gray-100 text-gray-500 cursor-default"
                : plan.highlight
                  ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  : "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
            )}>
            {loading === plan.id ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
            ) : plan.id === currentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  );
}