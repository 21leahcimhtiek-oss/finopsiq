import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnomalyContext {
  service: string;
  spend_actual: number;
  spend_expected: number;
  deviation_pct: number;
  cloud_provider: string;
  account_name: string;
  detected_at: string;
  historical_context?: {
    avg_daily_spend: number;
    previous_7_days: number[];
  };
}

export async function explainAnomaly(context: AnomalyContext): Promise<string> {
  const prompt = `Analyze this cloud cost anomaly and provide a clear, concise explanation for a DevOps engineer.

Service: ${context.service}
Cloud Provider: ${context.cloud_provider}
Account: ${context.account_name}
Detected At: ${context.detected_at}
Actual Spend: $${context.spend_actual.toFixed(2)}
Expected Spend: $${context.spend_expected.toFixed(2)}
Deviation: +${context.deviation_pct.toFixed(1)}%
${context.historical_context ? `Average Daily Spend (last 30d): $${context.historical_context.avg_daily_spend.toFixed(2)}
Last 7 Days Spend: ${context.historical_context.previous_7_days.map((d) => `$${d.toFixed(2)}`).join(", ")}` : ""}

Provide a 2-3 sentence explanation that:
1. States what happened (the spike)
2. Lists the most likely causes for this specific service
3. Recommends an immediate investigation step

Be specific and technical. Avoid generic advice.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a cloud cost anomaly analyst. Provide clear, actionable explanations for cost spikes.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  return (
    response.choices[0].message.content ||
    "Unable to generate explanation at this time."
  );
}