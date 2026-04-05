import { detectWaste } from "@/lib/openai/detect-waste";

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  findings: [
                    {
                      resource_id: "i-idle-abc123",
                      resource_type: "EC2 Instance",
                      waste_type: "idle_instance",
                      estimated_monthly_waste_usd: 340.5,
                      recommendation: "This EC2 instance has been stopped for 45 days. Terminate it or create an AMI if needed for future use.",
                      confidence_score: 0.97,
                    },
                    {
                      resource_id: "db-over-provisioned",
                      resource_type: "RDS Database",
                      waste_type: "over_provisioned",
                      estimated_monthly_waste_usd: 180.0,
                      recommendation: "Downsize from db.r5.2xlarge to db.r5.large — utilization is consistently below 10%.",
                      confidence_score: 0.88,
                    },
                  ],
                  total_estimated_monthly_waste_usd: 520.5,
                  summary: "Found 2 waste items: 1 idle instance and 1 over-provisioned database.",
                }),
              },
            },
          ],
        }),
      },
    },
  }));
});

const mockCostRecords = [
  { service: "Amazon EC2", resource_id: "i-idle-abc123", region: "us-east-1", amount_usd: 340.5, usage_date: "2024-01-15", tags: null },
  { service: "Amazon RDS", resource_id: "db-over-provisioned", region: "us-east-1", amount_usd: 180.0, usage_date: "2024-01-15", tags: null },
];

const mockMetadata = [
  { resource_id: "i-idle-abc123", resource_type: "EC2 Instance", state: "stopped", instance_type: "m5.xlarge", last_used: "2023-12-01", utilization_pct: 0, region: "us-east-1" },
  { resource_id: "db-over-provisioned", resource_type: "RDS Database", state: "available", instance_type: "db.r5.2xlarge", utilization_pct: 8, region: "us-east-1" },
];

describe("detectWaste", () => {
  it("should return structured waste findings", async () => {
    const result = await detectWaste(mockCostRecords, mockMetadata, "aws", "Production Account");

    expect(result.findings).toHaveLength(2);
    expect(result.total_estimated_monthly_waste_usd).toBe(520.5);
    expect(result.summary).toBeTruthy();
  });

  it("should return valid confidence scores between 0 and 1", async () => {
    const result = await detectWaste(mockCostRecords, mockMetadata, "aws", "Test Account");

    for (const finding of result.findings) {
      expect(finding.confidence_score).toBeGreaterThanOrEqual(0);
      expect(finding.confidence_score).toBeLessThanOrEqual(1);
    }
  });

  it("should include required fields in each finding", async () => {
    const result = await detectWaste(mockCostRecords, mockMetadata, "aws", "Test Account");

    for (const finding of result.findings) {
      expect(finding).toHaveProperty("resource_id");
      expect(finding).toHaveProperty("resource_type");
      expect(finding).toHaveProperty("waste_type");
      expect(finding).toHaveProperty("estimated_monthly_waste_usd");
      expect(finding).toHaveProperty("recommendation");
      expect(finding).toHaveProperty("confidence_score");
    }
  });

  it("should handle OpenAI errors gracefully", async () => {
    const OpenAI = (await import("openai")).default as jest.Mock;
    OpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error("OpenAI API error")),
        },
      },
    }));

    await expect(
      detectWaste(mockCostRecords, mockMetadata, "aws", "Test Account")
    ).rejects.toThrow();
  });
});