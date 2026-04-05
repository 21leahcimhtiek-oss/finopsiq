import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ data: [] });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = parseInt(searchParams.get("per_page") ?? "20");

  const { data, count } = await supabase
    .from("anomalies")
    .select("*, cloud_account:cloud_accounts(provider, account_name)", { count: "exact" })
    .eq("org_id", member.org_id)
    .order("detected_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return NextResponse.json({
    data: data ?? [],
    meta: { total: count ?? 0, page, per_page: perPage },
  });
}