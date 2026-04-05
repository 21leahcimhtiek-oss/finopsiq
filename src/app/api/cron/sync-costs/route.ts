import { createClient as createAdmin } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { fetchCostRecords as fetchAWS } from "@/lib/cloud/aws";
import { fetchCostRecords as fetchGCP } from "@/lib/cloud/gcp";
import { fetchCostRecords as fetchAzure } from "@/lib/cloud/azure";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: accounts } = await supabase
    .from("cloud_accounts")
    .select("*")
    .eq("is_active", true);

  if (!accounts?.length) return NextResponse.json({ data: { synced: 0 } });

  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dateRange = { start, end };

  let totalSynced = 0;

  for (const account of accounts) {
    try {
      const records =
        account.provider === "aws" ? await fetchAWS(account.account_id, dateRange) :
        account.provider === "gcp" ? await fetchGCP(account.account_id, dateRange) :
        await fetchAzure(account.account_id, dateRange);

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

      await supabase.from("cost_records").upsert(toInsert, {
        onConflict: "cloud_account_id,service,usage_date",
        ignoreDuplicates: true,
      });

      await supabase
        .from("cloud_accounts")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", account.id);

      totalSynced += toInsert.length;
    } catch (err) {
      console.error(`Failed to sync account ${account.id}:`, err);
    }
  }

  return NextResponse.json({ data: { synced: totalSynced, accounts: accounts.length } });
}