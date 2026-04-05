import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, getPlanFromPriceId } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const orgId = session.metadata?.org_id;
      const plan = session.metadata?.plan;
      if (orgId && plan) {
        await supabase.from("orgs").update({
          plan,
          stripe_subscription_id: session.subscription as string,
        }).eq("id", orgId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.org_id;
      if (orgId) {
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : "starter";
        await supabase.from("orgs").update({ plan, stripe_subscription_id: sub.id }).eq("id", orgId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.org_id;
      if (orgId) {
        await supabase.from("orgs").update({ plan: "starter", stripe_subscription_id: null }).eq("id", orgId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`Payment failed for customer ${invoice.customer}`);
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}