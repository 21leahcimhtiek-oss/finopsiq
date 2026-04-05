# FinOpsIQ Architecture

## System Overview

FinOpsIQ is a Next.js 14 full-stack application deployed on Vercel, using Supabase for auth and database, and integrating with cloud provider billing APIs.

## Data Flow

```
Cloud Providers (AWS/GCP/Azure)
         |
         v
[Cost Ingestion Layer]
  - AWS Cost Explorer API
  - GCP BigQuery Billing Export
  - Azure Cost Management REST API
         |
         v
[Supabase PostgreSQL]
  - cost_records (partitioned by org_id)
  - waste_findings
  - anomalies
  - budgets
         |
         v
[AI Analysis Layer (GPT-4o)]
  - Waste detection
  - Anomaly explanation
         |
         v
[Next.js API Routes]
  - REST endpoints
  - Server components
         |
         v
[React Dashboard]
  - Real-time KPIs
  - Recharts visualizations
  - Supabase RLS enforced
```

## Component Architecture

### Frontend
- **App Router** (Next.js 14) — Server components for data fetching, client components for interactivity
- **Tailwind CSS** — Utility-first styling with custom brand colors
- **Recharts** — AreaChart for spend trends, responsive containers
- **Lucide React** — Icon library

### Backend
- **Next.js API Routes** — REST API with Zod validation
- **Supabase Server Client** — Row-Level Security enforced on all DB operations
- **Rate Limiting** — Upstash Redis sliding window

### Database (Supabase PostgreSQL)
- **RLS Policies** — Org-based isolation: users only see their org's data
- **Indexes** — On `org_id + usage_date`, `cloud_account_id`, `service`
- **JSONB** — Tags and filters stored as flexible JSON

### AI Layer
- **GPT-4o** — Waste detection and anomaly explanation
- **JSON Mode** — Structured output with Zod validation
- **Rate Limited** — 10 AI requests/minute per user

## Security Model

1. **Auth**: Supabase JWT tokens, middleware validates on every request
2. **Authorization**: RLS policies in PostgreSQL — no data leakage between orgs
3. **Secrets**: All credentials encrypted before DB storage
4. **API**: Zod validation on all inputs, proper HTTP status codes

## Deployment Architecture

```
Vercel Edge Network
  ├── Next.js App (Serverless Functions)
  ├── Static Assets (CDN)
  └── Cron Jobs (daily cost sync)

Supabase
  ├── PostgreSQL (primary database)
  ├── Auth (JWT + OAuth)
  └── Storage (optional for reports)

Upstash Redis
  └── Rate limiting counters

Sentry
  └── Error monitoring + performance
```

## Scaling Considerations

- **Database**: Add read replicas for analytics queries
- **Cost Sync**: Move to background job queue (e.g., Inngest) for large accounts
- **AI Analysis**: Cache GPT-4o responses for identical cost profiles
- **Multi-region**: Deploy to Vercel Edge regions near customers