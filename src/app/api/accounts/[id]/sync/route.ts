import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { fetchCostRecords as fetchAWS } from "@/lib/cloud/aws";
import { fetchCostRecords as fetchGCP } from "@/lib/cloud/gcp";
import { fetchCostRecords as fetchAzure } from "@/lib/cloud/azure";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await supabase
    .from("cloud_accounts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dateRange = { start, end };

  let records: Awaited<ReturnType<typeof fetchAWS>>;

  if (account.provider === "aws") {
    records = await fetchAWS(account.account_id, dateRange);
  } else if (account.provider === "gcp") {
    records = await fetchGCP(account.account_id, dateRange);
  } else {
    records = await fetchAzure(account.account_id, dateRange);
  }

  const toInsert = records.map((r) => ({
    org_id: account.org_id,
    cloud_account_id: account.id,
    service: r.service,
    resource_id: r.resource_id,
    region: r.region,
    amount_usd: r.amount_usd,
    currency: r.currency,
    usage_date: r.usage_date,
    tags: r.tags,
  }));

  const { error } = await supabase.from("cost_records").upsert(toInsert, {
    onConflict: "cloud_account_id,service,usage_date",
    ignoreDuplicates: true,
  });

  await supabase
    .from("cloud_accounts")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { synced: toInsert.length } });
}