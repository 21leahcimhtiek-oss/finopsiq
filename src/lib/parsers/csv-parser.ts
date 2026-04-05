import Papa from "papaparse";
import type { CostRecord } from "@/types";

interface NormalizedRecord {
  service: string;
  resource_id: string | null;
  region: string | null;
  amount_usd: number;
  currency: string;
  period_start: string;
  period_end: string;
  tags: Record<string, string>;
}

// AWS Cost Explorer CSV format
function parseAwsRow(row: Record<string, string>): NormalizedRecord | null {
  const amount = parseFloat(row["lineItem/UnblendedCost"] ?? row["UnblendedCost"] ?? "0");
  if (isNaN(amount) || amount === 0) return null;
  const tags: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k.startsWith("resourceTags/") && v) {
      tags[k.replace("resourceTags/", "")] = v;
    }
  }
  return {
    service: row["lineItem/ProductCode"] ?? row["ProductName"] ?? "Unknown",
    resource_id: row["lineItem/ResourceId"] ?? null,
    region: row["product/region"] ?? row["Region"] ?? null,
    amount_usd: amount,
    currency: row["lineItem/CurrencyCode"] ?? "USD",
    period_start: row["lineItem/UsageStartDate"]?.split("T")[0] ?? row["UsageStartDate"]?.split("T")[0] ?? "",
    period_end: row["lineItem/UsageEndDate"]?.split("T")[0] ?? row["UsageEndDate"]?.split("T")[0] ?? "",
    tags,
  };
}

// GCP Billing CSV format
function parseGcpRow(row: Record<string, string>): NormalizedRecord | null {
  const amount = parseFloat(row["Cost"] ?? row["cost"] ?? "0");
  if (isNaN(amount) || amount === 0) return null;
  const tags: Record<string, string> = {};
  const labelsStr = row["Labels"] ?? row["labels"] ?? "";
  if (labelsStr) {
    labelsStr.split(";").forEach((pair) => {
      const [k, v] = pair.split(":");
      if (k && v) tags[k.trim()] = v.trim();
    });
  }
  const usageDate = row["Usage start date"] ?? row["usage_start_time"]?.split("T")[0] ?? "";
  return {
    service: row["Service description"] ?? row["service.description"] ?? "Unknown",
    resource_id: row["Resource name"] ?? null,
    region: row["Location"] ?? row["location.region"] ?? null,
    amount_usd: amount,
    currency: row["Currency"] ?? "USD",
    period_start: usageDate,
    period_end: row["Usage end date"] ?? usageDate,
    tags,
  };
}

// Azure Cost Management CSV format
function parseAzureRow(row: Record<string, string>): NormalizedRecord | null {
  const amount = parseFloat(row["CostInBillingCurrency"] ?? row["Cost"] ?? row["PreTaxCost"] ?? "0");
  if (isNaN(amount) || amount === 0) return null;
  const tags: Record<string, string> = {};
  const tagsStr = row["Tags"] ?? "";
  if (tagsStr) {
    tagsStr.split(";").forEach((pair) => {
      const [k, v] = pair.split(":");
      if (k && v) tags[k.trim()] = v.trim();
    });
  }
  const date = row["Date"] ?? row["UsageDateTime"] ?? "";
  return {
    service: row["ServiceName"] ?? row["MeterCategory"] ?? "Unknown",
    resource_id: row["ResourceId"] ?? row["InstanceId"] ?? null,
    region: row["ResourceLocation"] ?? null,
    amount_usd: amount,
    currency: row["BillingCurrencyCode"] ?? row["Currency"] ?? "USD",
    period_start: date.split("T")[0],
    period_end: date.split("T")[0],
    tags,
  };
}

function detectProvider(headers: string[]): "aws" | "gcp" | "azure" | null {
  const h = headers.map((h) => h.toLowerCase());
  if (h.some((h) => h.includes("lineitem/") || h.includes("unblendedcost"))) return "aws";
  if (h.some((h) => h.includes("service description") || h.includes("billing account id"))) return "gcp";
  if (h.some((h) => h.includes("costinbillingcurrency") || h.includes("billingaccountname"))) return "azure";
  return null;
}

export function parseCsv(
  csvContent: string,
  orgId: string,
  cloudAccountId: string,
  forceProvider?: "aws" | "gcp" | "azure"
): Omit<CostRecord, "id" | "created_at">[] {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0) {
    console.warn("CSV parse warnings:", result.errors.slice(0, 3));
  }

  const headers = result.meta.fields ?? [];
  const provider = forceProvider ?? detectProvider(headers);

  if (!provider) {
    throw new Error("Unable to detect cloud provider from CSV headers. Expected AWS Cost Explorer, GCP Billing, or Azure Cost Management format.");
  }

  const parser = provider === "aws" ? parseAwsRow : provider === "gcp" ? parseGcpRow : parseAzureRow;

  const records: Omit<CostRecord, "id" | "created_at">[] = [];

  for (const row of result.data) {
    const normalized = parser(row);
    if (!normalized || !normalized.period_start) continue;
    records.push({
      org_id: orgId,
      cloud_account_id: cloudAccountId,
      service: normalized.service,
      resource_id: normalized.resource_id,
      region: normalized.region,
      amount_usd: normalized.amount_usd,
      currency: normalized.currency,
      period_start: normalized.period_start,
      period_end: normalized.period_end || normalized.period_start,
      tags: normalized.tags,
    });
  }

  return records;
}