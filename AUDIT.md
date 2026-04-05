# FinOpsIQ — Security & Compliance Audit Checklist

## Authentication & Authorization

- [x] Supabase Auth with email/password and OAuth (Google, GitHub)
- [x] Row Level Security (RLS) on all database tables — org-level isolation
- [x] JWT validation on every API route via Supabase middleware
- [x] Role-based access: `owner`, `admin`, `member`, `viewer`
- [x] Team invite flow with email verification
- [x] Session expiry and refresh token rotation

## Data Security

- [x] Cloud credentials encrypted at rest with AES-256-GCM before storage
- [x] Encryption key stored in environment variable (never in DB)
- [x] No cloud credentials logged or exposed in API responses
- [x] Supabase service role key used only server-side
- [x] All secrets in environment variables, never hardcoded

## API Security

- [x] Rate limiting on all routes (60 req/min standard, 5 req/min AI endpoints)
- [x] Zod input validation on all POST/PATCH routes
- [x] Stripe webhook signature verification
- [x] CORS headers configured in Next.js
- [x] Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

## Infrastructure

- [x] HTTPS enforced (Vercel default)
- [x] Environment variables never committed to git
- [x] .env.example with no real values
- [x] Sentry error tracking (no PII in events)
- [x] Docker image uses non-root user

## Compliance Readiness

- [ ] SOC 2 Type II — in progress (controls documented)
- [x] GDPR — data deletion API available, no PII in cost records
- [x] Data retention enforced by plan limits
- [ ] HIPAA — not applicable (no PHI)
- [ ] PCI DSS — Stripe handles all card data, no card data stored

## Dependency Security

- Run `npm audit` before each release
- Dependabot enabled for automated security PRs
- No known critical vulnerabilities at time of release

## Incident Response

1. Sentry alert fires → on-call engineer paged
2. Assess scope (which orgs affected, data type)
3. Contain: rotate affected credentials, disable compromised accounts
4. Notify affected customers within 72 hours (GDPR requirement)
5. Post-mortem published internally within 5 business days