# FinOpsIQ — Product Description

## The Problem

Cloud costs are out of control. The average company wastes 32% of its cloud spend on idle resources, over-provisioned instances, and forgotten services. Meanwhile, DevOps teams have no visibility into who is spending what — and finance teams are flying blind until the monthly bill arrives.

## The Solution

FinOpsIQ connects to your AWS, GCP, and Azure accounts in minutes, pulls in real-time cost data, and uses GPT-4o to automatically identify waste and explain anomalies. Set budgets, get alerts before overspending, and give every team accountability for their cloud costs.

## Features

### Multi-Cloud Cost Visibility
- Connect unlimited cloud accounts across AWS, GCP, and Azure
- Unified cost view with per-service, per-region, and per-tag breakdowns
- Daily cost trend charts and 30-day spend history
- Tag-based cost attribution for chargeback/showback

### AI Waste Detection
- GPT-4o analyzes your resources and identifies:
  - Idle EC2 instances, stopped VMs, deallocated Azure VMs
  - Over-provisioned RDS, Cloud SQL, Azure SQL databases
  - Orphaned EBS volumes, GCS buckets, Azure Blobs
  - Unused reserved instances and savings plans
  - Unattached Elastic IPs and load balancers
- Each finding includes a specific recommendation and confidence score
- Average customer finds $8,000-$45,000 in monthly waste

### Budget Enforcement
- Create budgets per account, team, project, or any tag combination
- Configurable alert thresholds (default: alert at 80%, critical at 100%)
- Auto-actions: notify on breach, or restrict new resource creation
- Real-time budget utilization dashboard

### Anomaly Detection
- Detects spend spikes as they happen (daily analysis)
- GPT-4o generates plain-English explanations for each anomaly
- Severity levels: Low, Medium, High, Critical
- Historical baseline comparison (30-day rolling average)

### Executive Reporting
- One-click CSV and JSON exports
- Date range filtering with service and account filters
- Shareable reports for finance reviews

## Pricing

| Plan | Price | Accounts | AI Features |
|------|-------|----------|-------------|
| Team | $99/month | Up to 5 | Basic |
| Business | $299/month | Up to 20 | Full (GPT-4o) |
| Enterprise | $999/month | Unlimited | Full + Custom |

All plans include a 14-day free trial. No credit card required.

## Customer Stories

> "We identified $180,000/year in waste in the first week. The ROI was immediate. FinOpsIQ paid for itself 500x over."
> — Head of Infrastructure, Series C SaaS Company

> "Our AWS bill dropped 38% in 60 days. The AI recommendations are incredibly specific and actionable."
> — Principal Cloud Engineer, Healthcare Technology

> "Finally, every team can see exactly what they are spending. Chargebacks are now automatic."
> — VP of Platform Engineering, E-commerce Scale-up

## FAQ

**Q: How do I connect my cloud accounts?**
A: You provide read-only credentials (IAM role for AWS, service account for GCP, service principal for Azure). FinOpsIQ never has write access.

**Q: Is my data secure?**
A: All data is encrypted at rest and in transit. Credentials are encrypted before storage. Row-Level Security in PostgreSQL ensures complete data isolation between organizations.

**Q: How accurate is the waste detection?**
A: GPT-4o achieves 90%+ accuracy on waste identification. Each finding includes a confidence score. False positives can be dismissed with one click.

**Q: Does this work with reserved instances / savings plans?**
A: Yes. FinOpsIQ detects unutilized reserved capacity and recommends right-sizing or selling unused reservations on the marketplace.