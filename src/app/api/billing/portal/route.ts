import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  const { data: org } = await supabase.from("organizations").select("*").eq("id", member?.org_id).single();

  if (!org?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  });

  return NextResponse.json({ data: { url: session.url } });
}