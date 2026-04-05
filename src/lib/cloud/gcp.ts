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
  machine_type?: string;
  last_used?: string;
  utilization_pct?: number;
  region: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export async function fetchCostRecords(
  projectId: string,
  dateRange: DateRange
): Promise<CostRecord[]> {
  // In production: query BigQuery billing export table
  // SELECT service.description, resource.name, usage_start_time, cost, currency
  // FROM `billing_dataset.gcp_billing_export_v1_XXXXXX`
  // WHERE DATE(usage_start_time) BETWEEN @start AND @end

  const services = [
    "Compute Engine",
    "BigQuery",
    "Cloud Storage",
    "Google Kubernetes Engine",
    "Cloud SQL",
    "Cloud Run",
  ];
  const regions = ["us-central1", "us-east1", "europe-west1"];
  const records: CostRecord[] = [];

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    for (const service of services) {
      const baseAmount = {
        "Compute Engine": 95,
        BigQuery: 45,
        "Cloud Storage": 8,
        "Google Kubernetes Engine": 65,
        "Cloud SQL": 55,
        "Cloud Run": 12,
      }[service] ?? 10;

      records.push({
        service,
        resource_id: `${projectId}/${service.toLowerCase().replace(/\s/g, "-")}-001`,
        region: regions[Math.floor(Math.random() * regions.length)],
        amount_usd: baseAmount * (0.8 + Math.random() * 0.4),
        currency: "USD",
        usage_date: d.toISOString().split("T")[0],
        tags: { env: "prod", project: projectId },
      });
    }
  }

  return records;
}

export async function fetchResourceMetadata(
  projectId: string
): Promise<ResourceMetadata[]> {
  return [
    {
      resource_id: `${projectId}/instances/backend-vm-001`,
      resource_type: "Compute Engine VM",
      state: "RUNNING",
      machine_type: "n2-standard-8",
      last_used: new Date().toISOString(),
      utilization_pct: 6,
      region: "us-central1",
    },
    {
      resource_id: `${projectId}/instances/old-dev-vm`,
      resource_type: "Compute Engine VM",
      state: "TERMINATED",
      machine_type: "e2-standard-4",
      last_used: "2024-09-01T00:00:00Z",
      utilization_pct: 0,
      region: "us-east1",
    },
    {
      resource_id: `${projectId}/datasets/analytics_warehouse`,
      resource_type: "BigQuery Dataset",
      state: "ACTIVE",
      last_used: new Date().toISOString(),
      region: "us-central1",
    },
  ];
}