import Stripe from "stripe";
import type { PlanLimits } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    cloud_accounts: 3,
    data_retention_months: 6,
    team_members: 5,
    anomaly_detection: false,
    ai_recommendations: false,
    api_access: false,
  },
  pro: {
    cloud_accounts: 15,
    data_retention_months: 18,
    team_members: 25,
    anomaly_detection: true,
    ai_recommendations: false,
    api_access: true,
  },
  enterprise: {
    cloud_accounts: -1, // unlimited
    data_retention_months: 36,
    team_members: -1,
    anomaly_detection: true,
    ai_recommendations: true,
    api_access: true,
  },
};

export const PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};

export function getPlanFromPriceId(priceId: string): string {
  for (const [plan, pid] of Object.entries(PRICE_IDS)) {
    if (pid === priceId) return plan;
  }
  return "starter";
}