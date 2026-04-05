# Changelog

All notable changes to FinOpsIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-07-01

### Added
- Initial production release
- Multi-cloud cost ingestion: AWS Cost Explorer, GCP Billing, Azure Cost Management CSV upload
- AI-powered anomaly detection using GPT-4o-mini with human-readable explanations
- ML-based 30/60/90-day cost forecasting with confidence intervals
- Budget creation and management with percentage-threshold alerts
- Cost allocation by service, region, team tag, environment
- Rightsizing recommendations with AI-generated savings analysis
- Chargeback and showback report generation (CSV/PDF)
- Slack webhook and email alert integrations
- Stripe billing: Starter ($99), Pro ($249), Enterprise ($599) plans
- Plan limits: cloud account quotas, data retention enforcement
- Team management: invite members, role-based access control
- Supabase Auth with email/password and social OAuth
- Row Level Security on all 9 database tables
- AES-256-GCM encryption for cloud credentials
- Rate limiting via Upstash Redis
- Sentry error tracking and performance monitoring
- CI/CD pipeline with GitHub Actions (lint, typecheck, test, build, e2e)
- Docker support for self-hosted deployments
- Vercel one-click deploy configuration

## [0.9.0] - 2024-06-15

### Added
- Beta release to 50 design partners
- Core cost ingestion pipeline
- Basic anomaly detection (statistical, pre-AI)
- Budget alerts via email only

### Changed
- Migrated from Pages Router to App Router
- Replaced custom auth with Supabase Auth

## [0.1.0] - 2024-03-01

### Added
- Project scaffolding
- Database schema design
- Initial UI wireframes