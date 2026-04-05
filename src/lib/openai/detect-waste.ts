import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WasteFindingSchema = z.object({
  resource_id: z.string(),
  resource_type: z.string(),
  waste_type: z.string(),
  estimated_monthly_waste_usd: z.number(),
  recommendation: z.string(),
  confidence_score: z.number().min(0).max(1),
});

const WasteAnalysisSchema = z.object({
  findings: z.array(WasteFindingSchema),
  total_estimated_monthly_waste_usd: z.number(),
  summary: z.string(),
});

export type WasteFinding = z.infer<typeof WasteFindingSchema>;
export type WasteAnalysis = z.infer<typeof WasteAnalysisSchema>;

interface CostRecord {
  service: string;
  resource_id: string | null;
  region: string | null;
  amount_usd: number;
  usage_date: string;
  tags: Record<string, string> | null;
}

interface ResourceMetadata {
  resource_id: string;
  resource_type: string;
  state: string;
  instance_type?: string;
  last_used?: string;
  utilization_pct?: number;
}

export async function detectWaste(
  costRecords: CostRecord[],
  resourceMetadata: ResourceMetadata[],
  cloudProvider: string,
  accountName: string
): Promise<WasteAnalysis> {
  const prompt = `You are a cloud cost optimization expert. Analyze the following cloud cost records and resource metadata for ${cloudProvider} account "${accountName}" and identify waste.

## Cost Records (last 30 days)
${JSON.stringify(costRecords.slice(0, 100), null, 2)}

## Resource Metadata
${JSON.stringify(resourceMetadata.slice(0, 50), null, 2)}

Identify wasteful resources including:
- Idle/stopped instances still being charged
- Over-provisioned instances (high memory/CPU allocation, low utilization)
- Unused reserved capacity
- Orphaned storage volumes or snapshots
- Unused load balancers or IP addresses
- Resources with zero recent activity

Return a JSON object with this exact structure:
{
  "findings": [
    {
      "resource_id": "string",
      "resource_type": "string (e.g. EC2 Instance, RDS Database, S3 Bucket)",
      "waste_type": "string (e.g. idle_instance, over_provisioned, orphaned_storage)",
      "estimated_monthly_waste_usd": number,
      "recommendation": "specific actionable recommendation",
      "confidence_score": number between 0 and 1
    }
  ],
  "total_estimated_monthly_waste_usd": number,
  "summary": "brief summary of findings"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a cloud FinOps expert. Always respond with valid JSON matching the requested schema.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const rawContent = response.choices[0].message.content;
  if (!rawContent) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(rawContent);
  return WasteAnalysisSchema.parse(parsed);
}