# FinOpsIQ User Guide

## Getting Started

### 1. Connect Your First Cloud Account

1. Navigate to **Cloud Accounts** in the sidebar
2. Click **Connect Account**
3. Select your cloud provider (AWS, GCP, or Azure)
4. Enter your account ID and name
5. Paste your credentials (IAM role ARN for AWS, service account JSON for GCP, etc.)
6. Click **Connect Account**

After connecting, click **Sync Now** to pull your first 30 days of cost data.

### AWS Setup
Create a read-only IAM role with these permissions:
- `ce:GetCostAndUsage`
- `ce:GetCostForecast`
- `ec2:DescribeInstances`
- `rds:DescribeDBInstances`
- `s3:ListAllMyBuckets`

### GCP Setup
Create a service account with these roles:
- `roles/billing.viewer`
- `roles/bigquery.dataViewer` (for billing export)

### Azure Setup
Create a service principal with `Cost Management Reader` role on your subscription.

---

## Setting Up Budgets

1. Go to **Budgets** and click **New Budget**
2. Enter a budget name (e.g., "Production AWS")
3. Set the monthly limit in USD
4. Configure the alert threshold (default: 80%)
5. Optionally set an auto-action (notify or restrict)

Budget progress is updated daily during the cost sync.

---

## Running Waste Scans

1. Navigate to **Waste Detection**
2. Click **Run AI Scan** to trigger a GPT-4o analysis
3. Review findings — each shows:
   - Resource type and ID
   - Waste type (idle, over-provisioned, orphaned, etc.)
   - Estimated monthly waste in USD
   - Specific recommendation
   - Confidence score

For each finding, you can:
- **Mark Resolved** — After taking action
- **Dismiss** — If the finding is a false positive

---

## Understanding Anomalies

Anomalies are detected when daily spend for a service deviates significantly from the expected baseline.

Each anomaly shows:
- **Service** — Which cloud service spiked
- **Actual vs Expected** — Comparison of real vs baseline spend
- **Deviation %** — How far above normal
- **AI Explanation** — GPT-4o generated analysis of likely causes and next steps

Severity levels:
- 🟡 **Low** — 25-50% above expected
- 🟠 **Medium** — 50-100% above expected
- 🔴 **High** — 100-200% above expected
- 🚨 **Critical** — 200%+ above expected

---

## Exporting Reports

1. Go to **Reports**
2. Select a date range
3. Choose format: **CSV** or **JSON**
4. Click **Download Report**

The export includes all cost records for the selected period.

---

## Team Management

1. Go to **Settings**
2. In the Team Members section, enter a colleague's email
3. Click **Invite**
4. They receive an email invitation to join your organization

Roles:
- **Owner** — Full access, billing management
- **Admin** — Can manage accounts, budgets, and members
- **Member** — Read-only access to cost data