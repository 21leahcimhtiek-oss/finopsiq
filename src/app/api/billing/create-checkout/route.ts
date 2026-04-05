import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS } from "@/lib/stripe/client";
import { z } from "zod";

const schema = z.object({ plan: z.enum(["starter", "pro", "enterprise"]) });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: membership } = await supabase.from("org_members")
    .select("org_id, role, orgs(id, name, stripe_customer_id)")
    .eq("user_id", user.id).single();

  if (!membership || membership.role !== "owner") {
    return NextResponse.json({ error: "Only org owners can manage billing" }, { status: 403 });
  }

  const org = membership.orgs as { id: string; name: string; stripe_customer_id: string | null } | null;
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: org.name, metadata: { org_id: org.id } });
    customerId = customer.id;
    await supabase.from("orgs").update({ stripe_customer_id: customerId }).eq("id", org.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[parsed.data.plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { org_id: org.id, plan: parsed.data.plan },
    subscription_data: { metadata: { org_id: org.id, plan: parsed.data.plan } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}