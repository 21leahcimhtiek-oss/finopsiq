# FinOpsIQ Security Audit Checklist

## Authentication & Authorization
- [ ] Supabase Auth with JWT tokens
- [ ] Row-Level Security (RLS) enabled on all database tables
- [ ] Organization-based access isolation verified
- [ ] Role-based access control (owner/admin/member) enforced
- [ ] Session expiry and refresh token rotation enabled
- [ ] Auth middleware protecting all dashboard routes

## Data Encryption
- [ ] Cloud credentials encrypted at rest before storage
- [ ] TLS 1.3 enforced for all API communications
- [ ] Supabase database encryption at rest enabled
- [ ] Sensitive env vars stored in secrets manager (not in code)
- [ ] No credentials in git history (pre-commit hooks)

## API Security
- [ ] Rate limiting on all API routes (Upstash Redis)
- [ ] Input validation with Zod on all POST/PATCH endpoints
- [ ] SQL injection prevention via parameterized queries (Supabase client)
- [ ] CORS restricted to known domains
- [ ] Stripe webhook signature verification
- [ ] Cron endpoints protected with secret header

## Rate Limiting
- [ ] 100 req/min per user on general API routes
- [ ] 10 req/min on AI-powered endpoints (waste scan, anomaly explain)
- [ ] 5 req/min on auth endpoints
- [ ] IP-based rate limiting for unauthenticated endpoints

## Dependency Audit
- [ ] `npm audit` run and vulnerabilities addressed
- [ ] Dependabot or Renovate enabled for automated updates
- [ ] Lock file committed (package-lock.json)
- [ ] No known CVEs in production dependencies

## Secrets Management
- [ ] All secrets stored as environment variables
- [ ] .env files excluded from version control
- [ ] Separate secrets for dev/staging/production
- [ ] Secret rotation policy documented
- [ ] Service role key only used server-side (never exposed to client)

## Monitoring & Incident Response
- [ ] Sentry error tracking configured
- [ ] Alert on unusual spend spikes (anomaly detection)
- [ ] Audit log for sensitive operations (account creation, member invite)
- [ ] Incident response runbook documented