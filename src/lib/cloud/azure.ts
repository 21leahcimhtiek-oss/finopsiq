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
  sku?: string;
  last_used?: string;
  utilization_pct?: number;
  region: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export async function fetchCostRecords(
  subscriptionId: string,
  dateRange: DateRange
): Promise<CostRecord[]> {
  // In production: call Azure Cost Management API
  // GET /subscriptions/{subscriptionId}/providers/Microsoft.CostManagement/query
  // with timePeriod filter

  const services = [
    "Azure Kubernetes Service",
    "Azure Virtual Machines",
    "Azure Storage",
    "Azure SQL Database",
    "Azure App Service",
    "Azure Monitor",
  ];
  const regions = ["eastus", "westeurope", "southeastasia"];
  const records: CostRecord[] = [];

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    for (const service of services) {
      const baseAmount = {
        "Azure Kubernetes Service": 110,
        "Azure Virtual Machines": 90,
        "Azure Storage": 10,
        "Azure SQL Database": 70,
        "Azure App Service": 30,
        "Azure Monitor": 15,
      }[service] ?? 10;

      records.push({
        service,
        resource_id: `/subscriptions/${subscriptionId}/resourceGroups/prod-rg/${service.toLowerCase().replace(/\s/g, "-")}-001`,
        region: regions[Math.floor(Math.random() * regions.length)],
        amount_usd: baseAmount * (0.8 + Math.random() * 0.4),
        currency: "USD",
        usage_date: d.toISOString().split("T")[0],
        tags: { environment: "production", costCenter: "engineering" },
      });
    }
  }

  return records;
}

export async function fetchResourceMetadata(
  subscriptionId: string
): Promise<ResourceMetadata[]> {
  return [
    {
      resource_id: `/subscriptions/${subscriptionId}/resourceGroups/prod-rg/providers/Microsoft.ContainerService/managedClusters/aks-prod`,
      resource_type: "AKS Cluster",
      state: "Running",
      sku: "Standard",
      last_used: new Date().toISOString(),
      utilization_pct: 45,
      region: "eastus",
    },
    {
      resource_id: `/subscriptions/${subscriptionId}/resourceGroups/old-rg/providers/Microsoft.Compute/virtualMachines/dev-vm-01`,
      resource_type: "Virtual Machine",
      state: "Deallocated",
      sku: "Standard_D4s_v3",
      last_used: "2024-10-01T00:00:00Z",
      utilization_pct: 0,
      region: "westeurope",
    },
  ];
}