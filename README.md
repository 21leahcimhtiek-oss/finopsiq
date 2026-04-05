# FinOpsIQ

[![CI](https://github.com/21leahcimhtiek-oss/finopsiq/actions/workflows/ci.yml/badge.svg)](https://github.com/21leahcimhtiek-oss/finopsiq/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**Multi-cloud cost optimization platform** giving DevOps and platform teams real-time spend analytics, AI-powered waste detection, and budget enforcement across AWS, GCP, and Azure.

## Features

- **Multi-Cloud Ingestion** — Connect AWS Cost Explorer, GCP Billing, and Azure Cost Management
- **AI Waste Detection** — GPT-4o identifies idle resources, oversized instances, unused reservations
- **Budget Rules Engine** — Set thresholds, alert on overspend, trigger auto-actions
- **Cost Attribution** — Tag-based attribution by team, project, and environment
- **Anomaly Detection** — ML-powered spend spike alerts with AI explanations
- **Executive Dashboard** — KPIs, trend charts, and exportable reports

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o |
| Auth | Supabase Auth |
| Billing | Stripe |
| Monitoring | Sentry |
| Rate Limiting | Upstash Redis |
| Testing | Jest, Playwright |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/21leahcimhtiek-oss/finopsiq.git
cd finopsiq

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

See [.env.example](.env.example) for all required environment variables.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting |

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/21leahcimhtiek-oss/finopsiq)

See [deploy/vercel-deploy.md](deploy/vercel-deploy.md) for detailed instructions.

### Docker

```bash
docker build -t finopsiq .
docker run -p 3000:3000 --env-file .env.local finopsiq
```

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/accounts` | GET/POST | List/create cloud accounts |
| `/api/accounts/:id/sync` | POST | Trigger cost sync |
| `/api/costs` | GET | Query cost records |
| `/api/waste` | GET/POST | Waste findings + AI scan |
| `/api/budgets` | GET/POST | Budget management |
| `/api/anomalies` | GET | Anomaly feed |
| `/api/analytics` | GET | Aggregated analytics |
| `/api/billing/create-checkout` | POST | Create Stripe checkout |
| `/api/billing/webhook` | POST | Stripe webhook handler |

See [docs/api.md](docs/api.md) for full API documentation.

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT — see [LICENSE](LICENSE)