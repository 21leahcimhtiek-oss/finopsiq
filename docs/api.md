# FinOpsIQ API Reference

All endpoints require JWT auth via `Authorization: Bearer <token>` header (or Supabase session cookie).

Base URL: `https://your-domain.com/api`

## Accounts

### GET /api/accounts
List all cloud accounts for the authenticated org.

### POST /api/accounts
Create a new cloud account.

Body: `{ name, provider, credentials_json }`  
Credentials are AES-256-GCM encrypted before storage.

### GET /api/accounts/:id
Get a specific cloud account.

### PATCH /api/accounts/:id
Update a cloud account.

### DELETE /api/accounts/:id
Delete a cloud account and all associated cost records.

### POST /api/accounts/:id/sync
Upload a CSV file to import cost records.

Body: `multipart/form-data` with `file` field (CSV).

Response: `{ records_inserted: number }`  
Rate limited to 60 req/min.

## Costs

### GET /api/costs
Get cost records. Requires `start` and `end` query params (ISO date).

Optional: `account_id`, `service`, `region`  
Rate limited to 60 req/min.

## Anomalies

### GET /api/anomalies
List anomalies. Optional `status` filter (open/acknowledged/resolved).

### PATCH /api/anomalies/:id
Update anomaly status.

Body: `{ status: 'open' | 'acknowledged' | 'resolved' }`  
AI detection rate limited to 5 req/min.

## Budgets

### GET /api/budgets
List all budgets for the org.

### POST /api/budgets
Create a budget.

Body: `{ name, amount_usd, period, scope_type, scope_value, alert_threshold_pct }`  
### PATCH /api/budgets/:id
Update a budget.

### DELETE /api/budgets/:id
Delete a budget.

## Recommendations

### GET /api/recommendations
List recommendations. Optional `status` filter.

### PATCH /api/recommendations/:id
Update recommendation status (open/implementing/dismissed/implemented).

## Billing

### POST /api/billing/create-checkout
Create Stripe checkout session.

Body: `{ plan: 'starter' | 'pro' | 'enterprise' }`  
Response: `{ url: string }` (redirect to Stripe)

### POST /api/billing/portal
Create Stripe customer portal session.

Response: `{ url: string }`  

### POST /api/billing/webhook
Stripe webhook endpoint (no auth required, validates Stripe signature).

## Auth

### POST /api/auth/invite
Invite a user to the org.

Body: `{ email: string }`  
Requires admin role.
