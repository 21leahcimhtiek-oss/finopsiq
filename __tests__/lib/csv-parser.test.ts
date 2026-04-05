import { parseCsv } from "@/lib/parsers/csv-parser";

const AWS_CSV = `identity/LineItemId,identity/TimeInterval,lineItem/UsageAccountId,lineItem/LineItemDescription,lineItem/ProductCode,lineItem/UsageStartDate,lineItem/BlendedCost,product/region,resourceTags/user:Name
row1,2024-01-01T00:00:00Z/2024-01-02T00:00:00Z,123456789,EC2 usage,AmazonEC2,2024-01-01T00:00:00Z,150.75,us-east-1,my-instance`;

const GCP_CSV = `billing_account_id,service.description,sku.description,usage_start_time,usage_end_time,project.id,location.region,cost,currency,resource.name
my-billing,Compute Engine,N1 Predefined Instance Core running in Americas,2024-01-01T00:00:00Z,2024-01-02T00:00:00Z,my-project,us-central1,200.50,USD,instance-1`;

const AZURE_CSV = `SubscriptionId,ResourceGroupName,ServiceName,ServiceTier,Date,Currency,CostInBillingCurrency,ResourceId,ResourceLocation
sub-123,my-rg,Virtual Machines,D2s v3,2024-01-01,USD,175.25,/subscriptions/sub-123/virtualMachines/vm1,eastus`;

describe("parseCsv", () => {
  describe("AWS format", () => {
    it("detects and parses AWS Cost Explorer CSV", () => {
      const records = parseCsv(AWS_CSV, "account1");
      expect(records).toHaveLength(1);
      expect(records[0].service).toBe("AmazonEC2");
      expect(records[0].provider).toBe("aws");
      expect(Number(records[0].cost_usd)).toBeCloseTo(150.75);
      expect(records[0].region).toBe("us-east-1");
    });
  });

  describe("GCP format", () => {
    it("detects and parses GCP Billing CSV", () => {
      const records = parseCsv(GCP_CSV, "account1");
      expect(records).toHaveLength(1);
      expect(records[0].service).toBe("Compute Engine");
      expect(records[0].provider).toBe("gcp");
      expect(Number(records[0].cost_usd)).toBeCloseTo(200.50);
    });
  });

  describe("Azure format", () => {
    it("detects and parses Azure Cost Management CSV", () => {
      const records = parseCsv(AZURE_CSV, "account1");
      expect(records).toHaveLength(1);
      expect(records[0].service).toBe("Virtual Machines");
      expect(records[0].provider).toBe("azure");
      expect(Number(records[0].cost_usd)).toBeCloseTo(175.25);
    });
  });

  describe("validation", () => {
    it("skips rows with zero cost", () => {
      const csv = AWS_CSV.replace("150.75", "0.00");
      const records = parseCsv(csv, "account1");
      expect(records).toHaveLength(0);
    });

    it("throws on unknown CSV format", () => {
      expect(() => parseCsv("col1,col2\nval1,val2", "account1")).toThrow("Unknown CSV format");
    });
  });
});