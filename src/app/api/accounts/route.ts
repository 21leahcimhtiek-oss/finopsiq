import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const CreateAccountSchema = z.object({
  provider: z.enum(["aws", "gcp", "azure"]),
  account_id: z.string().min(1),
  account_name: z.string().min(1),
  credentials: z.string().optional(),
});

async function getOrgId(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase.from("members").select("org_id").eq("user_id", userId).single();
  return data?.org_id;
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ data: [], error: null });

  const { data, error } = await supabase
    .from("cloud_accounts")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ data: data ?? [], error: error?.message ?? null });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = CreateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization found" }, { status: 400 });

  // In production: encrypt credentials with KMS before storing
  const credentialsEncrypted = parsed.data.credentials
    ? Buffer.from(parsed.data.credentials).toString("base64")
    : null;

  const { data, error } = await supabase
    .from("cloud_accounts")
    .insert({
      org_id: orgId,
      provider: parsed.data.provider,
      account_id: parsed.data.account_id,
      account_name: parsed.data.account_name,
      credentials_encrypted: credentialsEncrypted,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}