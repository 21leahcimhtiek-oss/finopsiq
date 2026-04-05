import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectAnomalies } from "@/lib/openai/detect-anomalies";
import { checkRateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS } from "@/lib/stripe/client";
import { z } from "zod";

const triggerSchema = z.object({ cloud_account_id: z.string().uuid() });

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");

  let query = supabase.from("anomalies").select("*, cloud_accounts(name, provider)").eq("org_id", membership.org_id);
  if (status) query = query.eq("status", status);
  const { data: anomalies, error } = await query.order("detected_at", { ascending: false }).limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ anomalies });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id, "ai");
  if (!success) return NextResponse.json({ error: "AI rate limit exceeded. Max 5 requests per minute." }, { status: 429 });

  const { data: membership } = await supabase.from("org_members")
    .select("org_id, role, orgs(plan)")
    .eq("user_id", user.id).single();

  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const org = membership.orgs as { plan: string } | null;
  const limits = PLAN_LIMITS[org?.plan ?? "starter"];
  if (!limits.anomaly_detection) {
    return NextResponse.json({ error: "Anomaly detection requires a Pro or Enterprise plan." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = triggerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Get 30 days of cost data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: costData } = await supabase
    .from("cost_records")
    .select("service, amount_usd, period_start")
    .eq("org_id", membership.org_id)
    .eq("cloud_account_id", parsed.data.cloud_account_id)
    .gte("period_start", thirtyDaysAgo)
    .order("period_start");

  if (!costData || costData.length === 0) {
    return NextResponse.json({ error: "No cost data found for this account in the last 30 days." }, { status: 400 });
  }

  const costPoints = costData.map((r) => ({ service: r.service, date: r.period_start, amount: Number(r.amount_usd) }));
  const anomalies = await detectAnomalies(costPoints, membership.org_id);

  const inserted = [];
  for (const anomaly of anomalies) {
    const { data } = await supabase.from("anomalies").insert({
      org_id: membership.org_id,
      cloud_account_id: parsed.data.cloud_account_id,
      ...anomaly,
    }).select().single();
    if (data) inserted.push(data);
  }

  return NextResponse.json({ anomalies: inserted, detected: inserted.length });
}