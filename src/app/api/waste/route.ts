import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { detectWaste } from "@/lib/openai/detect-waste";
import { fetchResourceMetadata as awsMeta } from "@/lib/cloud/aws";
import { fetchResourceMetadata as gcpMeta } from "@/lib/cloud/gcp";
import { fetchResourceMetadata as azureMeta } from "@/lib/cloud/azure";
import { checkRateLimit, aiRateLimiter } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ data: [], error: null });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "open";

  const { data, error } = await supabase
    .from("waste_findings")
    .select("*, cloud_account:cloud_accounts(provider, account_name)")
    .eq("org_id", member.org_id)
    .eq("status", status)
    .order("found_at", { ascending: false });

  return NextResponse.json({ data: data ?? [], error: error?.message ?? null });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id, aiRateLimiter);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data: accounts } = await supabase
    .from("cloud_accounts")
    .select("*")
    .eq("org_id", member.org_id)
    .eq("is_active", true);

  if (!accounts?.length) return NextResponse.json({ data: { findings: 0 } });

  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  let totalFindings = 0;

  for (const account of accounts) {
    const { data: costData } = await supabase
      .from("cost_records")
      .select("service, resource_id, region, amount_usd, usage_date, tags")
      .eq("cloud_account_id", account.id)
      .gte("usage_date", startDate);

    const metadata =
      account.provider === "aws" ? await awsMeta(account.account_id) :
      account.provider === "gcp" ? await gcpMeta(account.account_id) :
      await azureMeta(account.account_id);

    const analysis = await detectWaste(costData ?? [], metadata, account.provider, account.account_name);

    const toInsert = analysis.findings.map((f) => ({
      org_id: member.org_id,
      cloud_account_id: account.id,
      resource_type: f.resource_type,
      resource_id: f.resource_id,
      waste_type: f.waste_type,
      estimated_monthly_waste_usd: f.estimated_monthly_waste_usd,
      recommendation: f.recommendation,
      confidence_score: f.confidence_score,
      status: "open",
    }));

    await supabase.from("waste_findings").upsert(toInsert, { onConflict: "cloud_account_id,resource_id", ignoreDuplicates: false });
    totalFindings += toInsert.length;
  }

  return NextResponse.json({ data: { findings: totalFindings } });
}