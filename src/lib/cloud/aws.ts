export interface CostRecord {
  service: string;
  resource_id: string | null;
  region: string;
  amount_usd: number;
  currency: string;
  usage_date: string;
  tags: Record<string, string> | null;
}

export interface ResourceMetadata {
  resource_id: string;
  resource_type: string;
  state: string;
  instance_type?: string;
  last_used?: string;
  utilization_pct?: number;
  region: string;
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export async function fetchCostRecords(
  accountId: string,
  dateRange: DateRange
): Promise<CostRecord[]> {
  // In production: call AWS Cost Explorer API using AWS SDK
  // const costExplorer = new CostExplorer({ region: 'us-east-1' });
  // const result = await costExplorer.getCostAndUsage({ ... }).promise();

  // Mock data structure representing realistic AWS costs
  const services = ["Amazon EC2", "Amazon RDS", "Amazon S3", "AWS Lambda", "Amazon CloudFront", "Amazon EKS"];
  const regions = ["us-east-1", "us-west-2", "eu-west-1"];
  const records: CostRecord[] = [];

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    for (const service of services) {
      const baseAmount = {
        "Amazon EC2": 120,
        "Amazon RDS": 85,
        "Amazon S3": 12,
        "AWS Lambda": 8,
        "Amazon CloudFront": 15,
        "Amazon EKS": 75,
      }[service] ?? 10;

      records.push({
        service,
        resource_id: `${service.toLowerCase().replace(/\s/g, "-")}-${accountId}-001`,
        region: regions[Math.floor(Math.random() * regions.length)],
        amount_usd: baseAmount * (0.8 + Math.random() * 0.4),
        currency: "USD",
        usage_date: d.toISOString().split("T")[0],
        tags: { Environment: "production", Team: "platform" },
      });
    }
  }

  return records;
}

export async function fetchResourceMetadata(
  accountId: string
): Promise<ResourceMetadata[]> {
  // In production: call AWS EC2 DescribeInstances, RDS DescribeDBInstances, etc.
  return [
    {
      resource_id: "i-0abc123def456",
      resource_type: "EC2 Instance",
      state: "stopped",
      instance_type: "m5.xlarge",
      last_used: "2024-11-15T10:00:00Z",
      utilization_pct: 0,
      region: "us-east-1",
    },
    {
      resource_id: "i-0def789abc012",
      resource_type: "EC2 Instance",
      state: "running",
      instance_type: "c5.4xlarge",
      last_used: new Date().toISOString(),
      utilization_pct: 4,
      region: "us-east-1",
    },
    {
      resource_id: "db-prod-analytics",
      resource_type: "RDS Database",
      state: "available",
      instance_type: "db.r5.2xlarge",
      last_used: new Date().toISOString(),
      utilization_pct: 8,
      region: "us-east-1",
    },
    {
      resource_id: "vol-0abc123xyz",
      resource_type: "EBS Volume",
      state: "available",
      last_used: "2024-10-01T00:00:00Z",
      utilization_pct: 0,
      region: "us-east-1",
    },
  ];
}