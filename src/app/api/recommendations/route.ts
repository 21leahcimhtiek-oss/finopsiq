import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRecommendations } from "@/lib/openai/generate-recommendations";
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
  const status = sp.get("status") ?? "open";

  const { data: recs, error } = await supabase
    .from("recommendations")
    .select("*, cloud_accounts(name, provider)")
    .eq("org_id", membership.org_id)
    .eq("status", status)
    .order("savings_usd", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendations: recs });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id, "ai");
  if (!success) return NextResponse.json({ error: "AI rate limit exceeded" }, { status: 429 });

  const { data: membership } = await supabase.from("org_members")
    .select("org_id, role, orgs(plan)")
    .eq("user_id", user.id).single();

  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const org = membership.orgs as { plan: string } | null;
  const limits = PLAN_LIMITS[org?.plan ?? "starter"];
  if (!limits.ai_recommendations) {
    return NextResponse.json({ error: "AI recommendations require an Enterprise plan." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = triggerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Get 90 days of cost data for this account
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: costData } = await supabase
    .from("cost_records")
    .select("id, org_id, cloud_account_id, service, resource_id, region, amount_usd, currency, period_start, period_end, tags, created_at")
    .eq("org_id", membership.org_id)
    .eq("cloud_account_id", parsed.data.cloud_account_id)
    .gte("period_start", ninetyDaysAgo);

  if (!costData || costData.length === 0) {
    return NextResponse.json({ error: "No cost data found for the last 90 days." }, { status: 400 });
  }

  const recs = await generateRecommendations(costData as Parameters<typeof generateRecommendations>[0]);

  const inserted = [];
  for (const rec of recs) {
    const { data } = await supabase.from("recommendations").insert({
      org_id: membership.org_id,
      cloud_account_id: parsed.data.cloud_account_id,
      ...rec,
    }).select().single();
    if (data) inserted.push(data);
  }

  return NextResponse.json({ recommendations: inserted, generated: inserted.length });
}