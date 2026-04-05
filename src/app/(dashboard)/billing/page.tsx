"use client";

import BillingPlans from "@/components/BillingPlans";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing</p>
      </div>
      <BillingPlans />
    </div>
  );
}