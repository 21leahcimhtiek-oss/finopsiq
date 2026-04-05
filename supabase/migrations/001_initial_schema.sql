-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'team' CHECK (plan IN ('team', 'business', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Cloud accounts table
CREATE TABLE cloud_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('aws', 'gcp', 'azure')),
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  credentials_encrypted TEXT,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, provider, account_id)
);

-- Cost records table
CREATE TABLE cost_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  resource_id TEXT,
  region TEXT,
  amount_usd NUMERIC(12, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  usage_date DATE NOT NULL,
  tags JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_records_org_date ON cost_records(org_id, usage_date DESC);
CREATE INDEX idx_cost_records_account ON cost_records(cloud_account_id);
CREATE INDEX idx_cost_records_service ON cost_records(service);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cloud_account_id UUID REFERENCES cloud_accounts(id) ON DELETE SET NULL,
  filters JSONB,
  monthly_limit_usd NUMERIC(12, 2) NOT NULL,
  alert_at_percent NUMERIC(5, 2) NOT NULL DEFAULT 80,
  auto_action TEXT CHECK (auto_action IN ('notify', 'restrict', NULL)),
  current_spend_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Waste findings table
CREATE TABLE waste_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  estimated_monthly_waste_usd NUMERIC(12, 2) NOT NULL,
  recommendation TEXT NOT NULL,
  confidence_score NUMERIC(4, 3),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'dismissed', 'resolved')),
  found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waste_findings_org_status ON waste_findings(org_id, status);

-- Anomalies table
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_account_id UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  service TEXT NOT NULL,
  spend_actual NUMERIC(12, 4) NOT NULL,
  spend_expected NUMERIC(12, 4) NOT NULL,
  deviation_pct NUMERIC(7, 2) NOT NULL,
  ai_explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anomalies_org_detected ON anomalies(org_id, detected_at DESC);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- RLS helper function
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM members WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role = 'owner'));

-- Members policies
CREATE POLICY "Members can view org members"
  ON members FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins can manage members"
  ON members FOR ALL
  USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Cloud accounts policies
CREATE POLICY "Members can view cloud accounts"
  ON cloud_accounts FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins can manage cloud accounts"
  ON cloud_accounts FOR ALL
  USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Cost records policies
CREATE POLICY "Members can view cost records"
  ON cost_records FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Budgets policies
CREATE POLICY "Members can view budgets"
  ON budgets FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins can manage budgets"
  ON budgets FOR ALL
  USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Waste findings policies
CREATE POLICY "Members can view waste findings"
  ON waste_findings FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins can manage waste findings"
  ON waste_findings FOR ALL
  USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Anomalies policies
CREATE POLICY "Members can view anomalies"
  ON anomalies FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));