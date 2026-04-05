import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/parsers/csv-parser";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: membership } = await supabase.from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Verify account belongs to org
  const { data: account } = await supabase
    .from("cloud_accounts")
    .select("id, provider")
    .eq("id", params.id)
    .eq("org_id", membership.org_id)
    .single();

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data with a CSV file" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided. Upload a CSV file in the 'file' field." }, { status: 400 });
  if (!file.name.endsWith(".csv")) return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });

  const csvContent = await file.text();
  let records;
  try {
    records = parseCsv(csvContent, membership.org_id, params.id, account.provider as "aws" | "gcp" | "azure");
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "No valid records found in CSV. Check the format." }, { status: 400 });
  }

  // Upsert in batches of 500
  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("cost_records").upsert(batch, {
      onConflict: "org_id,cloud_account_id,service,period_start,period_end",
      ignoreDuplicates: false,
    });
    if (error) console.error("Batch upsert error:", error);
    else inserted += batch.length;
  }

  // Update last_synced_at
  await supabase.from("cloud_accounts").update({ last_synced_at: new Date().toISOString(), status: "active" }).eq("id", params.id);

  return NextResponse.json({ success: true, records_processed: records.length, records_inserted: inserted });
}