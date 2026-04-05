import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { z } from "zod";

const Schema = z.object({
  price_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).single();
  const { data: org } = await supabase.from("organizations").select("*").eq("id", member?.org_id).single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    customer: org?.stripe_customer_id ?? undefined,
    line_items: [{ price: parsed.data.price_id, quantity: 1 }],
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/billing?canceled=true`,
    metadata: { org_id: org?.id ?? "", user_id: user.id },
    subscription_data: {
      metadata: { org_id: org?.id ?? "" },
    },
  });

  return NextResponse.json({ data: { url: session.url } });
}