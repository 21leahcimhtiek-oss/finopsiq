import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ data: null });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [costsRes, wasteRes, budgetsRes, anomaliesRes] = await Promise.all([
    supabase.from("cost_records").select("amount_usd, usage_date, service").eq("org_id", member.org_id).gte("usage_date", thirtyDaysAgo),
    supabase.from("waste_findings").select("estimated_monthly_waste_usd").eq("org_id", member.org_id).eq("status", "open"),
    supabase.from("budgets").select("monthly_limit_usd, current_spend_usd").eq("org_id", member.org_id),
    supabase.from("anomalies").select("id").eq("org_id", member.org_id).gte("detected_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const costs = costsRes.data ?? [];
  const totalSpend = costs.reduce((s, r) => s + Number(r.amount_usd), 0);
  const totalWaste = (wasteRes.data ?? []).reduce((s, r) => s + Number(r.estimated_monthly_waste_usd), 0);
  const totalBudget = (budgetsRes.data ?? []).reduce((s, b) => s + Number(b.monthly_limit_usd), 0);
  const totalCurrentSpend = (budgetsRes.data ?? []).reduce((s, b) => s + Number(b.current_spend_usd), 0);

  const serviceMap: Record<string, number> = {};
  const dailyMap: Record<string, number> = {};
  for (const r of costs) {
    serviceMap[r.service] = (serviceMap[r.service] ?? 0) + Number(r.amount_usd);
    dailyMap[r.usage_date] = (dailyMap[r.usage_date] ?? 0) + Number(r.amount_usd);
  }

  const spendByService = Object.entries(serviceMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([service, amount]) => ({ service, amount }));

  const dailyTrend = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  return NextResponse.json({
    data: {
      total_spend_usd: totalSpend,
      total_waste_usd: totalWaste,
      potential_savings_usd: totalWaste * 0.8,
      budget_utilization_pct: totalBudget > 0 ? (totalCurrentSpend / totalBudget) * 100 : 0,
      spend_by_service: spendByService,
      daily_trend: dailyTrend,
      open_waste_count: wasteRes.data?.length ?? 0,
      anomaly_count: anomaliesRes.data?.length ?? 0,
    },
  });
}