import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto/encrypt";
import { checkRateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS } from "@/lib/stripe/client";
import { z } from "zod";

const createSchema = z.object({
  provider: z.enum(["aws", "gcp", "azure"]),
  name: z.string().min(2).max(100),
  account_id: z.string().min(4).max(100),
  credentials: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "No organization found" }, { status: 404 });

  const { data: accounts, error } = await supabase
    .from("cloud_accounts")
    .select("id, org_id, provider, name, account_id, status, last_synced_at, created_at")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { data: membership } = await supabase.from("org_members")
    .select("org_id, role, orgs(plan)")
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const org = membership.orgs as { plan: string } | null;
  const limits = PLAN_LIMITS[org?.plan ?? "starter"];

  if (limits.cloud_accounts !== -1) {
    const { count } = await supabase.from("cloud_accounts").select("id", { count: "exact", head: true }).eq("org_id", membership.org_id);
    if ((count ?? 0) >= limits.cloud_accounts) {
      return NextResponse.json({ error: `Your plan allows a maximum of ${limits.cloud_accounts} cloud accounts. Please upgrade.` }, { status: 403 });
    }
  }

  const encryptedCredentials = parsed.data.credentials ? encrypt(parsed.data.credentials) : null;

  const { data: account, error } = await supabase.from("cloud_accounts").insert({
    org_id: membership.org_id,
    provider: parsed.data.provider,
    name: parsed.data.name,
    account_id: parsed.data.account_id,
    credentials_encrypted: encryptedCredentials,
    status: "pending",
  }).select("id, provider, name, account_id, status, created_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ account }, { status: 201 });
}