# FinOpsIQ API Reference

All API endpoints require authentication. Include your session token via Supabase Auth cookies (handled automatically by the Next.js client).

## Base URL

```
https://your-app.vercel.app/api
```

## Authentication

API routes use Supabase server-side auth. The session is read from cookies automatically. For server-to-server calls, include the `Authorization: Bearer <token>` header.

## Rate Limits

- General endpoints: 100 requests/minute per user
- AI endpoints: 10 requests/minute per user

---

## Cloud Accounts

### List Accounts
`GET /api/accounts`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "provider": "aws",
      "account_id": "123456789012",
      "account_name": "Production AWS",
      "last_synced_at": "2024-01-15T12:00:00Z",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "error": null
}
```

### Create Account
`POST /api/accounts`

**Body:**
```json
{
  "provider": "aws",
  "account_id": "123456789012",
  "account_name": "Production AWS",
  "credentials": "arn:aws:iam::123456789012:role/FinOpsIQRole"
}
```

### Sync Account
`POST /api/accounts/:id/sync`

Triggers a cost data sync for the specified account (fetches last 30 days).

**Response:**
```json
{ "data": { "synced": 180 } }
```

---

## Cost Records

### Query Costs
`GET /api/costs`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `account_id` | uuid | Filter by cloud account |
| `service` | string | Filter by service name (partial match) |
| `start_date` | YYYY-MM-DD | Start of date range |
| `end_date` | YYYY-MM-DD | End of date range |
| `region` | string | Filter by region |
| `page` | number | Page number (default: 1) |
| `per_page` | number | Results per page (default: 50, max: 100) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "service": "Amazon EC2",
      "resource_id": "i-0abc123",
      "region": "us-east-1",
      "amount_usd": 120.50,
      "currency": "USD",
      "usage_date": "2024-01-15",
      "tags": { "env": "prod", "team": "platform" }
    }
  ],
  "meta": { "total": 450, "page": 1, "per_page": 50 }
}
```

---

## Waste Detection

### Get Findings
`GET /api/waste?status=open`

Status options: `open`, `dismissed`, `resolved`

### Run AI Scan
`POST /api/waste`

Triggers GPT-4o waste analysis across all active cloud accounts.

**Response:**
```json
{ "data": { "findings": 7 } }
```

### Update Finding Status
`PATCH /api/waste/:id`

**Body:**
```json
{ "status": "resolved" }
```

---

## Budgets

### List Budgets
`GET /api/budgets`

### Create Budget
`POST /api/budgets`

**Body:**
```json
{
  "name": "Production AWS",
  "monthly_limit_usd": 5000,
  "alert_at_percent": 80,
  "auto_action": "notify"
}
```

### Update Budget
`PATCH /api/budgets/:id`

### Delete Budget
`DELETE /api/budgets/:id`

---

## Anomalies

### Get Anomaly Feed
`GET /api/anomalies`

**Query Parameters:** `page`, `per_page`

---

## Analytics

### Get Summary
`GET /api/analytics`

**Response:**
```json
{
  "data": {
    "total_spend_usd": 45230.50,
    "total_waste_usd": 8400.00,
    "potential_savings_usd": 6720.00,
    "budget_utilization_pct": 67.5,
    "spend_by_service": [
      { "service": "Amazon EC2", "amount": 18000 }
    ],
    "daily_trend": [
      { "date": "2024-01-15", "amount": 1500.25 }
    ],
    "open_waste_count": 12,
    "anomaly_count": 3
  }
}
```

---

## Billing

### Create Checkout Session
`POST /api/billing/create-checkout`

**Body:**
```json
{ "price_id": "price_xxx" }
```

**Response:**
```json
{ "data": { "url": "https://checkout.stripe.com/pay/xxx" } }
```

### Open Billing Portal
`POST /api/billing/portal`

**Response:**
```json
{ "data": { "url": "https://billing.stripe.com/session/xxx" } }
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |