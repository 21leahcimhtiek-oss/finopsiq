import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  scope_type: z.enum(["org", "account", "service", "tag", "region"]),
  scope_value: z.string().optional(),
  amount_usd: z.number().positive(),
  period: z.enum(["monthly", "quarterly", "annual"]),
  alert_threshold_pct: z.number().int().min(1).max(100).default(80),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: budgets, error } = await supabase
    .from("budgets")
    .select("*, budget_alerts(id, triggered_at, percentage_used, acknowledged_at)")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ budgets });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { data: budget, error } = await supabase.from("budgets").insert({
    org_id: membership.org_id,
    ...parsed.data,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ budget }, { status: 201 });
}