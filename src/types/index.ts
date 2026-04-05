export type OrgPlan = "team" | "business" | "enterprise";
export type MemberRole = "owner" | "admin" | "member";
export type CloudProvider = "aws" | "gcp" | "azure";
export type WasteStatus = "open" | "dismissed" | "resolved";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  org_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CloudAccount {
  id: string;
  org_id: string;
  provider: CloudProvider;
  account_id: string;
  account_name: string;
  credentials_encrypted: string | null;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CostRecord {
  id: string;
  org_id: string;
  cloud_account_id: string;
  service: string;
  resource_id: string | null;
  region: string | null;
  amount_usd: number;
  currency: string;
  usage_date: string;
  tags: Record<string, string> | null;
  created_at: string;
}

export interface Budget {
  id: string;
  org_id: string;
  name: string;
  cloud_account_id: string | null;
  filters: Record<string, unknown> | null;
  monthly_limit_usd: number;
  alert_at_percent: number;
  auto_action: "notify" | "restrict" | null;
  current_spend_usd: number;
  created_at: string;
  updated_at: string;
}

export interface WasteFinding {
  id: string;
  org_id: string;
  cloud_account_id: string;
  resource_type: string;
  resource_id: string;
  waste_type: string;
  estimated_monthly_waste_usd: number;
  recommendation: string;
  confidence_score: number | null;
  status: WasteStatus;
  found_at: string;
  updated_at: string;
  cloud_account?: CloudAccount;
}

export interface Anomaly {
  id: string;
  org_id: string;
  cloud_account_id: string;
  detected_at: string;
  service: string;
  spend_actual: number;
  spend_expected: number;
  deviation_pct: number;
  ai_explanation: string | null;
  created_at: string;
  cloud_account?: CloudAccount;
}

export interface AnalyticsSummary {
  total_spend_usd: number;
  total_waste_usd: number;
  potential_savings_usd: number;
  budget_utilization_pct: number;
  spend_by_provider: { provider: CloudProvider; amount: number }[];
  spend_by_service: { service: string; amount: number }[];
  daily_trend: { date: string; amount: number; provider?: CloudProvider }[];
  open_waste_count: number;
  anomaly_count: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface CostFilters extends PaginationParams {
  account_id?: string;
  service?: string;
  start_date?: string;
  end_date?: string;
  region?: string;
  tags?: Record<string, string>;
}