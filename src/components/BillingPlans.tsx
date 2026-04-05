"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "team",
    name: "Team",
    price: 99,
    priceId: "price_PLACEHOLDER_TEAM",
    features: [
      "Up to 5 cloud accounts",
      "Cost tracking & analytics",
      "Basic waste detection",
      "Email alerts",
      "CSV exports",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 299,
    priceId: "price_PLACEHOLDER_BUSINESS",
    highlighted: true,
    features: [
      "Up to 20 cloud accounts",
      "AI-powered waste detection",
      "Budget rules engine",
      "Anomaly detection",
      "API access",
      "Slack/PagerDuty alerts",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    priceId: "price_PLACEHOLDER_ENTERPRISE",
    features: [
      "Unlimited cloud accounts",
      "All Business features",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated support",
      "On-premise option",
    ],
  },
];

export default function BillingPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribe(priceId: string, planId: string) {
    setLoading(planId);
    const res = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_id: priceId }),
    });
    const json = await res.json();
    if (json.data?.url) {
      window.location.href = json.data.url;
    }
    setLoading(null);
  }

  async function manageSubscription() {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const json = await res.json();
    if (json.data?.url) window.location.href = json.data.url;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={manageSubscription}
          className="text-sm text-primary-600 hover:underline"
        >
          Manage existing subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "bg-white rounded-2xl p-6 border-2",
              plan.highlighted
                ? "border-primary-600 shadow-lg shadow-primary-50"
                : "border-gray-100"
            )}
          >
            {plan.highlighted && (
              <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              ${plan.price}
              <span className="text-base font-normal text-gray-400">/mo</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe(plan.priceId, plan.id)}
              disabled={loading === plan.id}
              className={cn(
                "w-full py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50",
                plan.highlighted
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              {loading === plan.id ? "Redirecting..." : `Subscribe to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}