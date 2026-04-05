import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Cloud } from "lucide-react";
import SpendSummary from "@/components/SpendSummary";
import CostChart from "@/components/CostChart";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, orgs(id, name, plan)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");

  const orgId = membership.org_id;

  // Fetch dashboard data in parallel
  const [accountsResult, anomaliesResult, recommendationsResult, costsResult] = await Promise.all([
    supabase.from("cloud_accounts").select("id, provider, name, status").eq("org_id", orgId),
    supabase.from("anomalies").select("id, service, deviation_pct, status").eq("org_id", orgId).eq("status", "open").limit(5),
    supabase.from("recommendations").select("id, savings_usd").eq("org_id", orgId).eq("status", "open"),
    supabase.from("cost_records")
      .select("service, amount_usd, period_start")
      .eq("org_id", orgId)
      .gte("period_start", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("period_start", { ascending: true }),
  ]);

  const accounts = accountsResult.data ?? [];
  const anomalies = anomaliesResult.data ?? [];
  const recommendations = recommendationsResult.data ?? [];
  const costs = costsResult.data ?? [];

  const totalSavings = recommendations.reduce((sum, r) => sum + Number(r.savings_usd), 0);
  const currentMonthCosts = costs.filter((c) => {
    const d = new Date(c.period_start);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSpend = currentMonthCosts.reduce((sum, c) => sum + Number(c.amount_usd), 0);

  const stats = [
    { label: "Cloud Spend (this month)", value: `$${totalSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Accounts", value: accounts.filter((a) => a.status === "active").length.toString(), icon: Cloud, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Open Anomalies", value: anomalies.length.toString(), icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Potential Savings", value: `$${totalSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, icon: TrendingDown, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Cloud cost overview for your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend (60 days)</h2>
          <CostChart data={costs.map((c) => ({ date: c.period_start, service: c.service, amount: Number(c.amount_usd) }))} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Anomalies</h2>
          {anomalies.length === 0 ? (
            <p className="text-gray-500 text-sm">No open anomalies. Looking good!</p>
          ) : (
            <ul className="space-y-3">
              {anomalies.map((a) => (
                <li key={a.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">{a.service}</span>
                  <span className="text-sm font-bold text-amber-700">+{Number(a.deviation_pct).toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}