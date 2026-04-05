import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BillingPlans from "@/components/BillingPlans";
import { PLAN_LIMITS } from "@/lib/stripe/client";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("org_members").select("org_id, role, orgs(id, name, plan, stripe_subscription_id)").eq("user_id", user.id).single();
  if (!membership) redirect("/onboarding");

  const org = membership.orgs as { id: string; name: string; plan: string; stripe_subscription_id: string | null } | null;
  if (!org) redirect("/onboarding");

  const { count: accountCount } = await supabase
    .from("cloud_accounts")
    .select("id", { count: "exact", head: true })
    .eq("org_id", membership.org_id);

  const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.starter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-1">Manage your plan and subscription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize mb-4">
            {org.plan}
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cloud Accounts</span>
                <span className="font-medium">{accountCount ?? 0} / {limits.cloud_accounts === -1 ? "∞" : limits.cloud_accounts}</span>
              </div>
              {limits.cloud_accounts !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(((accountCount ?? 0) / limits.cloud_accounts) * 100, 100)}%` }} />
                </div>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Data Retention</span>
              <span className="font-medium float-right">{limits.data_retention_months} months</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">AI Anomaly Detection</span>
              <span className="float-right">{limits.anomaly_detection ? "✅" : "❌"}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">AI Recommendations</span>
              <span className="float-right">{limits.ai_recommendations ? "✅" : "❌"}</span>
            </div>
          </div>
          {org.stripe_subscription_id && membership.role === "owner" && (
            <form action="/api/billing/portal" method="POST" className="mt-4">
              <button type="submit" className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Manage Subscription
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2">
          <BillingPlans currentPlan={org.plan} />
        </div>
      </div>
    </div>
  );
}