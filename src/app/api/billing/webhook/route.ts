import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Stripe from "stripe";

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PLAN_MAP: Record<string, string> = {
  price_team: "team",
  price_business: "business",
  price_enterprise: "enterprise",
};

function getPlanFromPriceId(priceId: string): string {
  for (const [key, plan] of Object.entries(PLAN_MAP)) {
    if (priceId.includes(key)) return plan;
  }
  return "team";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.org_id;
    if (orgId && session.customer) {
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: session.customer as string })
        .eq("id", orgId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const orgId = subscription.metadata?.org_id;
    const priceId = subscription.items.data[0]?.price.id ?? "";
    const plan = getPlanFromPriceId(priceId);
    if (orgId) {
      await supabase.from("organizations").update({ plan }).eq("id", orgId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const orgId = subscription.metadata?.org_id;
    if (orgId) {
      await supabase.from("organizations").update({ plan: "team" }).eq("id", orgId);
    }
  }

  return NextResponse.json({ received: true });
}