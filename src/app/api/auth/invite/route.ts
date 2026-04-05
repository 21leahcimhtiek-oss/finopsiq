import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const InviteSchema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { data: member } = await supabase
    .from("members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { org_id: member.org_id },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Pre-create member record
  await supabase.from("members").upsert({
    org_id: member.org_id,
    user_id: invite.user.id,
    role: "member",
  });

  return NextResponse.json({ data: { invited: parsed.data.email } });
}