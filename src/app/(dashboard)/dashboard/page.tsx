import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatPercent } from "@/lib/utils";
import SpendChart from "@/components/SpendChart";
import {
  DollarSignIcon,
  TrashIcon,
  TrendingDownIcon,
  GaugeIcon,
  AlertTriangleIcon,
} from "lucide-react";

async function getAnalytics(orgId: string) {
  const supabase = createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [costsResult, wasteResult, budgetsResult, anomaliesResult] = await Promise.all([
    supabase
      .from("cost_records")
      .select("amount_usd, usage_date, service")
      .eq("org_id", orgId)
      .gte("usage_date", thirtyDaysAgo.toISOString().split("T")[0]),
    supabase
      .from("waste_findings")
      .select("estimated_monthly_waste_usd, status")
      .eq("org_id", orgId)
      .eq("status", "open"),
    supabase.from("budgets").select("monthly_limit_usd, current_spend_usd").eq("org_id", orgId),
    supabase
      .from("anomalies")
      .select("id, service, deviation_pct, detected_at")
      .eq("org_id", orgId)
      .order("detected_at", { ascending: false })
      .limit(5),
  ]);

  const totalSpend = (costsResult.data ?? []).reduce((s, r) => s + Number(r.amount_usd), 0);
  const totalWaste = (wasteResult.data ?? []).reduce((s, r) => s + Number(r.estimated_monthly_waste_usd), 0);
  const budgetUsage =
    (budgetsResult.data ?? []).reduce((s, b) => s + Number(b.current_spend_usd), 0) /
    Math.max((budgetsResult.data ?? []).reduce((s, b) => s + Number(b.monthly_limit_usd), 0), 1) * 100;

  // Build daily trend
  const dailyMap: Record<string, number> = {};
  for (const r of costsResult.data ?? []) {
    dailyMap[r.usage_date] = (dailyMap[r.usage_date] ?? 0) + Number(r.amount_usd);
  }
  const trend = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  return {
    totalSpend,
    totalWaste,
    potentialSavings: totalWaste * 0.8,
    budgetUsagePct: budgetUsage,
    trend,
    anomalies: anomaliesResult.data ?? [],
  };
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: memberData } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user!.id)
    .single();

  const orgId = memberData?.org_id ?? "";
  const analytics = orgId ? await getAnalytics(orgId) : null;

  const kpis = [
    {
      label: "Total Cloud Spend (30d)",
      value: formatCurrency(analytics?.totalSpend ?? 0),
      icon: DollarSignIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Waste Found",
      value: formatCurrency(analytics?.totalWaste ?? 0),
      icon: TrashIcon,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Potential Savings",
      value: formatCurrency(analytics?.potentialSavings ?? 0),
      icon: TrendingDownIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Budget Utilization",
      value: formatPercent(analytics?.budgetUsagePct ?? 0),
      icon: GaugeIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Cloud cost overview for the last 30 days</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Spend Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Spend Trend (30 days)</h2>
        <SpendChart data={analytics?.trend ?? []} />
      </div>

      {/* Recent Anomalies */}
      {(analytics?.anomalies ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Recent Anomalies</h2>
          </div>
          <div className="space-y-3">
            {analytics!.anomalies.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-700">{a.service}</span>
                <span className="text-sm font-semibold text-red-600">
                  +{Number(a.deviation_pct).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}