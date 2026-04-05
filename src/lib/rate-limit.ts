import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Standard API: 60 requests per minute per user
export const standardRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "finopsiq:standard",
});

// AI-powered endpoints: 5 requests per minute per user
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "finopsiq:ai",
});

export async function checkRateLimit(
  identifier: string,
  type: "standard" | "ai" = "standard"
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = type === "ai" ? aiRateLimit : standardRateLimit;
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}