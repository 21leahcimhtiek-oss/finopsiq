-- FinOpsIQ Initial Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGS
-- ============================================================
CREATE TABLE orgs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_select" ON orgs FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "org_members_update" ON orgs FOR UPDATE
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- ORG MEMBERS
-- ============================================================
CREATE TABLE org_members (
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_select_own_org" ON org_members FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "admins_manage_members" ON org_members FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- CLOUD ACCOUNTS
-- ============================================================
CREATE TABLE cloud_accounts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  provider              TEXT NOT NULL CHECK (provider IN ('aws','gcp','azure')),
  name                  TEXT NOT NULL,
  account_id            TEXT NOT NULL,
  credentials_encrypted TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','error','pending')),
  last_synced_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, provider, account_id)
);

ALTER TABLE cloud_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cloud_accounts_org_isolation" ON cloud_accounts FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_cloud_accounts_org_id ON cloud_accounts(org_id);

-- ============================================================
-- COST RECORDS
-- ============================================================
CREATE TABLE cost_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  cloud_account_id  UUID NOT NULL REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  service           TEXT NOT NULL,
  resource_id       TEXT,
  region            TEXT,
  amount_usd        NUMERIC(14,6) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  tags              JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cost_records_org_isolation" ON cost_records FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_cost_records_org_period ON cost_records(org_id, period_start DESC);
CREATE INDEX idx_cost_records_account ON cost_records(cloud_account_id, period_start DESC);
CREATE INDEX idx_cost_records_service ON cost_records(org_id, service);
CREATE INDEX idx_cost_records_tags ON cost_records USING gin(tags);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE budgets (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  scope_type            TEXT NOT NULL CHECK (scope_type IN ('org','account','service','tag','region')),
  scope_value           TEXT,
  amount_usd            NUMERIC(14,2) NOT NULL,
  period                TEXT NOT NULL CHECK (period IN ('monthly','quarterly','annual')),
  alert_threshold_pct   INTEGER NOT NULL DEFAULT 80 CHECK (alert_threshold_pct BETWEEN 1 AND 100),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_org_isolation" ON budgets FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_budgets_org_id ON budgets(org_id);

-- ============================================================
-- BUDGET ALERTS
-- ============================================================
CREATE TABLE budget_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  actual_spend    NUMERIC(14,2) NOT NULL,
  budget_amount   NUMERIC(14,2) NOT NULL,
  percentage_used NUMERIC(6,2) NOT NULL,
  acknowledged_at TIMESTAMPTZ
);

ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budget_alerts_org_isolation" ON budget_alerts FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_budget_alerts_budget_id ON budget_alerts(budget_id, triggered_at DESC);
CREATE INDEX idx_budget_alerts_org_id ON budget_alerts(org_id, triggered_at DESC);

-- ============================================================
-- ANOMALIES
-- ============================================================
CREATE TABLE anomalies (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id              UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  cloud_account_id    UUID REFERENCES cloud_accounts(id) ON DELETE SET NULL,
  service             TEXT NOT NULL,
  detected_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_daily_usd  NUMERIC(14,4) NOT NULL,
  actual_daily_usd    NUMERIC(14,4) NOT NULL,
  deviation_pct       NUMERIC(8,2) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  ai_explanation      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anomalies_org_isolation" ON anomalies FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_anomalies_org_detected ON anomalies(org_id, detected_at DESC);
CREATE INDEX idx_anomalies_status ON anomalies(org_id, status);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================
CREATE TABLE recommendations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                  UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  cloud_account_id        UUID REFERENCES cloud_accounts(id) ON DELETE SET NULL,
  resource_type           TEXT NOT NULL,
  resource_id             TEXT NOT NULL,
  region                  TEXT,
  current_cost_usd        NUMERIC(14,4) NOT NULL,
  recommended_cost_usd    NUMERIC(14,4) NOT NULL,
  savings_usd             NUMERIC(14,4) NOT NULL,
  recommendation          TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','implementing','implemented','dismissed')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recommendations_org_isolation" ON recommendations FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_recommendations_org_savings ON recommendations(org_id, savings_usd DESC);
CREATE INDEX idx_recommendations_status ON recommendations(org_id, status);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('chargeback','showback','executive_summary','cost_by_service','cost_by_team')),
  config      JSONB DEFAULT '{}',
  last_run_at TIMESTAMPTZ,
  schedule    TEXT,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_org_isolation" ON reports FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE INDEX idx_reports_org_id ON reports(org_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;