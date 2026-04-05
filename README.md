# FinOpsIQ

> Automated cloud cost intelligence for engineering teams

FinOpsIQ helps engineering teams eliminate cloud waste, detect cost anomalies before they become budget crises, and forecast spend with ML-powered accuracy.

[![CI](https://github.com/21leahcimhtiek-oss/finopsiq/actions/workflows/ci.yml/badge.svg)](https://github.com/21leahcimhtiek-oss/finopsiq/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Multi-cloud ingestion** — AWS Cost Explorer, GCP Billing, Azure Cost Management via CSV upload
- **AI anomaly detection** — GPT-4o-mini powered spike detection with human-readable explanations
- **ML forecasting** — 30/60/90-day cost projections with confidence intervals
- **Budget alerts** — threshold-based alerts via Slack and email
- **Cost allocation** — break down spend by team, project, environment, or tag
- **Rightsizing recommendations** — identify over-provisioned resources with specific savings
- **Chargeback/showback reports** — automated PDF/CSV export on a schedule
- **Stripe billing** — plan limits enforced on cloud accounts and data retention

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth |
| Payments | Stripe |
| AI/ML | OpenAI GPT-4o-mini |
| Rate Limiting | Upstash Redis |
| Monitoring | Sentry |
| Testing | Jest + Playwright |
| Deploy | Vercel |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/21leahcimhtiek-oss/finopsiq
cd finopsiq
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase, Stripe, OpenAI, Upstash credentials

# 3. Run database migrations
npx supabase db push

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [.env.example](.env.example) for all required variables.

## Database

Run migrations from `supabase/migrations/`. All tables use Row Level Security (RLS) to enforce org-level data isolation.

## Testing

```bash
npm test              # unit tests
npm run test:e2e      # playwright e2e
npm run test:coverage # coverage report
```

## Deployment

Deploy to Vercel with one click or see [deploy/vercel-deploy.md](deploy/vercel-deploy.md).

## Pricing

| Plan | Price | Cloud Accounts | Retention |
|------|-------|---------------|-----------|
| Starter | $99/mo | 3 | 6 months |
| Pro | $249/mo | 15 | 18 months |
| Enterprise | $599/mo | Unlimited | 36 months |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).