export type OrgPlan = "starter" | "pro" | "enterprise";
export type CloudProvider = "aws" | "gcp" | "azure";
export type AccountStatus = "active" | "inactive" | "error" | "pending";
export type AnomalyStatus = "open" | "acknowledged" | "resolved";
export type RecommendationStatus = "open" | "implementing" | "implemented" | "dismissed";
export type OrgMemberRole = "owner" | "admin" | "member" | "viewer";
export type BudgetPeriod = "monthly" | "quarterly" | "annual";
export type BudgetScopeType = "org" | "account" | "service" | "tag" | "region";
export type ReportType = "chargeback" | "showback" | "executive_summary" | "cost_by_service" | "cost_by_team";

export interface Org {
  id: string;
  name: string;
  plan: OrgPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: OrgMemberRole;
  created_at: string;
}

export interface CloudAccount {
  id: string;
  org_id: string;
  provider: CloudProvider;
  name: string;
  account_id: string;
  credentials_encrypted?: string;
  status: AccountStatus;
  last_synced_at: string | null;
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
  period_start: string;
  period_end: string;
  tags: Record<string, string>;
  created_at: string;
}

export interface Budget {
  id: string;
  org_id: string;
  name: string;
  scope_type: BudgetScopeType;
  scope_value: string | null;
  amount_usd: number;
  period: BudgetPeriod;
  alert_threshold_pct: number;
  created_at: string;
}

export interface BudgetAlert {
  id: string;
  budget_id: string;
  org_id: string;
  triggered_at: string;
  actual_spend: number;
  budget_amount: number;
  percentage_used: number;
  acknowledged_at: string | null;
}

export interface Anomaly {
  id: string;
  org_id: string;
  cloud_account_id: string | null;
  service: string;
  detected_at: string;
  expected_daily_usd: number;
  actual_daily_usd: number;
  deviation_pct: number;
  status: AnomalyStatus;
  ai_explanation: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  org_id: string;
  cloud_account_id: string | null;
  resource_type: string;
  resource_id: string;
  region: string | null;
  current_cost_usd: number;
  recommended_cost_usd: number;
  savings_usd: number;
  recommendation: string;
  status: RecommendationStatus;
  created_at: string;
}

export interface Report {
  id: string;
  org_id: string;
  name: string;
  type: ReportType;
  config: Record<string, unknown>;
  last_run_at: string | null;
  schedule: string | null;
  created_by: string;
  created_at: string;
}

export interface PlanLimits {
  cloud_accounts: number;
  data_retention_months: number;
  team_members: number;
  anomaly_detection: boolean;
  ai_recommendations: boolean;
  api_access: boolean;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
}