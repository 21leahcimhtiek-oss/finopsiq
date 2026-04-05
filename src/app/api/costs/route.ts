import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  if (!member) return NextResponse.json({ data: [], error: null });

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  const service = searchParams.get("service");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const region = searchParams.get("region");
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = parseInt(searchParams.get("per_page") ?? "50");
  const aggregate = searchParams.get("aggregate") === "true";

  let query = supabase
    .from("cost_records")
    .select("*", { count: "exact" })
    .eq("org_id", member.org_id);

  if (accountId) query = query.eq("cloud_account_id", accountId);
  if (service) query = query.ilike("service", `%${service}%`);
  if (startDate) query = query.gte("usage_date", startDate);
  if (endDate) query = query.lte("usage_date", endDate);
  if (region) query = query.eq("region", region);

  query = query
    .order("usage_date", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
    error: null,
    meta: { total: count ?? 0, page, per_page: perPage },
  });
}