import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "No organization found" }, { status: 404 });

  const sp = req.nextUrl.searchParams;
  const groupBy = sp.get("groupBy") ?? "service";
  const startDate = sp.get("startDate") ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const endDate = sp.get("endDate") ?? new Date().toISOString().split("T")[0];
  const accountId = sp.get("accountId");

  let query = supabase
    .from("cost_records")
    .select("service, region, amount_usd, period_start, tags, cloud_account_id")
    .eq("org_id", membership.org_id)
    .gte("period_start", startDate)
    .lte("period_start", endDate);

  if (accountId) query = query.eq("cloud_account_id", accountId);

  const { data: records, error } = await query.order("period_start", { ascending: true }).limit(10000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by groupBy dimension
  const aggregated = new Map<string, Map<string, number>>();
  for (const r of records ?? []) {
    const date = r.period_start;
    const dimension = groupBy === "service" ? r.service : groupBy === "region" ? (r.region ?? "unknown") : r.service;
    if (!aggregated.has(date)) aggregated.set(date, new Map());
    const dateMap = aggregated.get(date)!;
    dateMap.set(dimension, (dateMap.get(dimension) ?? 0) + Number(r.amount_usd));
  }

  const timeSeries = Array.from(aggregated.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dimensions]) => ({
      date,
      ...Object.fromEntries(dimensions.entries()),
      total: Array.from(dimensions.values()).reduce((a, b) => a + b, 0),
    }));

  const totalSpend = (records ?? []).reduce((sum, r) => sum + Number(r.amount_usd), 0);

  return NextResponse.json({ timeSeries, totalSpend, recordCount: records?.length ?? 0 });
}