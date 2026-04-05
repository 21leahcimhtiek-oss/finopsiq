import OpenAI from "openai";
import type { CostRecord } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RecommendationResult {
  resource_type: string;
  resource_id: string;
  region: string;
  current_cost_usd: number;
  recommended_cost_usd: number;
  savings_usd: number;
  recommendation: string;
}

function aggregateByResource(records: CostRecord[]): Map<string, { total: number; service: string; region: string }> {
  const map = new Map<string, { total: number; service: string; region: string }>();
  for (const r of records) {
    const key = r.resource_id ?? `${r.service}-unknown`;
    const existing = map.get(key);
    if (existing) {
      existing.total += Number(r.amount_usd);
    } else {
      map.set(key, { total: Number(r.amount_usd), service: r.service, region: r.region ?? "us-east-1" });
    }
  }
  return map;
}

async function generateRecommendation(
  resourceId: string,
  service: string,
  region: string,
  monthlyCost: number
): Promise<{ recommendation: string; savingsPct: number }> {
  const prompt = `You are a cloud cost optimization expert.

Resource ID: ${resourceId}
Service: ${service}
Region: ${region}
Monthly Cost: $${monthlyCost.toFixed(2)}

Based on this resource's cost pattern, provide ONE specific rightsizing or optimization recommendation. Include:
1. The specific action to take (e.g., "Downsize from m5.2xlarge to m5.xlarge")
2. Expected savings percentage

Respond in JSON format: {"recommendation": "...", "savings_pct": 30}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}");
    return {
      recommendation: parsed.recommendation ?? "Consider rightsizing this resource based on utilization metrics.",
      savingsPct: Math.min(Math.max(parsed.savings_pct ?? 20, 5), 70),
    };
  } catch {
    return {
      recommendation: "Review resource utilization and consider rightsizing or reserved instance pricing.",
      savingsPct: 20,
    };
  }
}

export async function generateRecommendations(
  records: CostRecord[]
): Promise<RecommendationResult[]> {
  const byResource = aggregateByResource(records);
  const results: RecommendationResult[] = [];

  // Focus on top 20 most expensive resources
  const topResources = Array.from(byResource.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20);

  for (const [resourceId, data] of topResources) {
    if (data.total < 10) continue; // Skip resources under $10/month

    const { recommendation, savingsPct } = await generateRecommendation(
      resourceId,
      data.service,
      data.region,
      data.total
    );

    const savingsUsd = data.total * (savingsPct / 100);
    results.push({
      resource_type: data.service,
      resource_id: resourceId,
      region: data.region,
      current_cost_usd: Number(data.total.toFixed(4)),
      recommended_cost_usd: Number((data.total - savingsUsd).toFixed(4)),
      savings_usd: Number(savingsUsd.toFixed(4)),
      recommendation,
    });

    // Rate limit: small delay between AI calls
    await new Promise((r) => setTimeout(r, 200));
  }

  return results.sort((a, b) => b.savings_usd - a.savings_usd);
}