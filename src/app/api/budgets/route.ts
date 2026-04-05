import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateBudgetSchema = z.object({
  name: z.string().min(1),
  monthly_limit_usd: z.number().positive(),
  alert_at_percent: z.number().min(1).max(100).default(80),
  cloud_account_id: z.string().uuid().optional(),
  filters: z.record(z.unknown()).optional(),
  auto_action: z.enum(["notify", "restrict"]).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ data: [] });

  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = CreateBudgetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data, error } = await supabase
    .from("budgets")
    .insert({ org_id: member.org_id, ...parsed.data })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}