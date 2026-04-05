import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto/encrypt";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  credentials: z.string().optional(),
});

async function getOrgMembership(userId: string) {
  const supabase = await createClient();
  return supabase.from("org_members").select("org_id, role").eq("user_id", userId).single();
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await getOrgMembership(user.id);
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: account } = await supabase
    .from("cloud_accounts")
    .select("id, org_id, provider, name, account_id, status, last_synced_at, created_at")
    .eq("id", params.id)
    .eq("org_id", membership.org_id)
    .single();

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  return NextResponse.json({ account });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await getOrgMembership(user.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.credentials) updates.credentials_encrypted = encrypt(parsed.data.credentials);

  const { data: account, error } = await supabase
    .from("cloud_accounts")
    .update(updates)
    .eq("id", params.id)
    .eq("org_id", membership.org_id)
    .select("id, provider, name, account_id, status, last_synced_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ account });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await getOrgMembership(user.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { error } = await supabase.from("cloud_accounts").delete().eq("id", params.id).eq("org_id", membership.org_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}