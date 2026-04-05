# FinOpsIQ Architecture

## Overview

FinOpsIQ is a multi-tenant SaaS built on Next.js 14 App Router, Supabase, and Stripe. It provides cloud cost visibility, AI-powered anomaly detection, budget management, and savings recommendations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router, React 18, TypeScript |
| Styling | Tailwind CSS, clsx |
| Database | Supabase (PostgreSQL + Auth) |
| Payments | Stripe (Subscriptions + Webhooks) |
| AI | OpenAI GPT-4o-mini |
| Rate Limiting | Upstash Redis |
| Monitoring | Sentry |
| CI/CD | GitHub Actions + Vercel |
| Containerization | Docker |

## Multi-Tenancy

Isolation is enforced at the database level via Supabase Row-Level Security (RLS). Every table has policies that restrict access to members of the same organization via the `org_members` join table.

## Data Flow

1. User uploads CSV from cloud provider (AWS/GCP/Azure)
2. `csv-parser.ts` auto-detects format and normalizes to `cost_records` schema
3. Records are upserted in batches of 500 to `cost_records` table
4. AI anomaly detection runs z-score analysis + GPT-4o-mini explanation
5. Recommendations engine queries underutilized resources and generates savings suggestions

## Authentication

Supabase Auth (JWT) is used for all user authentication. The middleware at `src/middleware.ts` protects all `/dashboard/*` and `/api/*` routes (except webhook).

## Plan Limits

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| Cloud Accounts | 3 | 15 | Unlimited |
| AI Features | No | Yes | Yes |
| Members | 5 | 25 | Unlimited |
| History | 6 months | 18 months | 36 months |
