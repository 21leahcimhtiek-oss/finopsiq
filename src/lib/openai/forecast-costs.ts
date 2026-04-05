import OpenAI from "openai";
import type { ForecastPoint } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function calcResidualStdDev(x: number[], y: number[], slope: number, intercept: number): number {
  const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const variance = residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / residuals.length;
  return Math.sqrt(variance);
}

export async function forecastCosts(
  historicalData: { date: string; total_usd: number }[],
  horizonDays: 30 | 60 | 90 = 90
): Promise<{ forecasts: ForecastPoint[]; summary: string }> {
  const sorted = [...historicalData].sort((a, b) => a.date.localeCompare(b.date));
  const x = sorted.map((_, i) => i);
  const y = sorted.map((p) => p.total_usd);

  const { slope, intercept } = linearRegression(x, y);
  const stdDev = calcResidualStdDev(x, y, slope, intercept);

  const lastDate = new Date(sorted[sorted.length - 1].date);
  const forecasts: ForecastPoint[] = [];

  for (let day = 1; day <= horizonDays; day++) {
    const futureX = x.length + day - 1;
    const predicted = Math.max(0, slope * futureX + intercept);
    const confidenceInterval = 1.96 * stdDev * Math.sqrt(1 + 1 / x.length);

    const date = new Date(lastDate);
    date.setDate(date.getDate() + day);

    forecasts.push({
      date: date.toISOString().split("T")[0],
      predicted: Number(predicted.toFixed(2)),
      lower_bound: Number(Math.max(0, predicted - confidenceInterval).toFixed(2)),
      upper_bound: Number((predicted + confidenceInterval).toFixed(2)),
    });
  }

  // Generate AI summary for the 30-day forecast
  const thirtyDayTotal = forecasts.slice(0, 30).reduce((sum, p) => sum + p.predicted, 0);
  const lastMonthTotal = y.slice(-30).reduce((a, b) => a + b, 0);
  const changePct = lastMonthTotal > 0 ? ((thirtyDayTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  let summary = `Projected spend for the next 30 days: $${thirtyDayTotal.toFixed(2)} (${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% vs last month).`;

  try {
    const prompt = `Cloud cost forecast summary:
- Historical data points: ${sorted.length} days
- Last 30 days total: $${lastMonthTotal.toFixed(2)}
- Next 30 days projected: $${thirtyDayTotal.toFixed(2)}
- Trend: ${slope > 0 ? "increasing" : "decreasing"} at $${Math.abs(slope).toFixed(2)}/day

Write a 2-sentence executive summary of this forecast and what it means for the team's budget.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.3,
    });

    summary = response.choices[0]?.message?.content ?? summary;
  } catch {
    // Use statistical summary if AI fails
  }

  return { forecasts, summary };
}