import OpenAI from "openai";
import type { CostDataPoint } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnomalyResult {
  service: string;
  expected_daily_usd: number;
  actual_daily_usd: number;
  deviation_pct: number;
  ai_explanation: string;
}

function calcStats(values: number[]): { mean: number; stdDev: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

function detectOutliers(series: { date: string; amount: number }[]): {
  isAnomaly: boolean;
  expected: number;
  actual: number;
  deviationPct: number;
} {
  if (series.length < 7) return { isAnomaly: false, expected: 0, actual: 0, deviationPct: 0 };
  const baseline = series.slice(0, -1).map((p) => p.amount);
  const { mean, stdDev } = calcStats(baseline);
  const latest = series[series.length - 1].amount;
  const deviationPct = mean > 0 ? ((latest - mean) / mean) * 100 : 0;
  const zScore = stdDev > 0 ? Math.abs(latest - mean) / stdDev : 0;
  return {
    isAnomaly: zScore > 2,
    expected: mean,
    actual: latest,
    deviationPct,
  };
}

async function generateExplanation(
  service: string,
  expected: number,
  actual: number,
  deviationPct: number,
  timeSeries: { date: string; amount: number }[]
): Promise<string> {
  const prompt = `You are a FinOps expert analyzing cloud cost anomalies.

Service: ${service}
Expected daily cost: $${expected.toFixed(2)}
Actual daily cost: $${actual.toFixed(2)}
Deviation: ${deviationPct.toFixed(1)}% ${deviationPct > 0 ? "increase" : "decrease"}
Recent 30-day trend (date: cost): ${timeSeries.slice(-10).map((p) => `${p.date}: $${p.amount.toFixed(2)}`).join(", ")}

Provide a concise 2-3 sentence explanation of the likely cause of this cost anomaly and what the engineering team should investigate. Be specific about common causes for this type of service.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? "Unusual cost spike detected. Please investigate recent deployments and resource changes.";
}

export async function detectAnomalies(
  costData: CostDataPoint[],
  orgId: string
): Promise<AnomalyResult[]> {
  // Group by service
  const byService = new Map<string, { date: string; amount: number }[]>();
  for (const record of costData) {
    if (!byService.has(record.service)) byService.set(record.service, []);
    byService.get(record.service)!.push({ date: record.date, amount: record.amount });
  }

  const anomalies: AnomalyResult[] = [];

  for (const [service, series] of byService.entries()) {
    const sorted = series.sort((a, b) => a.date.localeCompare(b.date));
    const { isAnomaly, expected, actual, deviationPct } = detectOutliers(sorted);

    if (isAnomaly && Math.abs(deviationPct) > 20) {
      // Only call AI for significant anomalies (>20% deviation)
      let explanation = "Unusual cost deviation detected. Please review recent resource changes.";
      try {
        explanation = await generateExplanation(service, expected, actual, deviationPct, sorted);
      } catch (error) {
        console.error(`Failed to generate AI explanation for ${service}:`, error);
      }

      anomalies.push({
        service,
        expected_daily_usd: Number(expected.toFixed(4)),
        actual_daily_usd: Number(actual.toFixed(4)),
        deviation_pct: Number(deviationPct.toFixed(2)),
        ai_explanation: explanation,
      });
    }
  }

  return anomalies;
}