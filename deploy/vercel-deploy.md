# Deploy FinOpsIQ to Vercel

## Prerequisites

- Vercel account (free tier works)
- Supabase project (free tier works for up to 500MB)
- Stripe account for billing
- OpenAI API key
- Upstash Redis instance

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/21leahcimhtiek-oss/finopsiq)

## Manual Deployment

### Step 1: Fork and Clone

```bash
git clone https://github.com/21leahcimhtiek-oss/finopsiq.git
cd finopsiq
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### Step 3: Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create 3 products with monthly prices (Team: $99, Business: $299, Enterprise: $999)
3. Copy the price IDs and update `stripe.json`
4. Set up a webhook pointing to `https://your-app.vercel.app/api/billing/webhook`
5. Add events: `checkout.session.completed`, `customer.subscription.*`

### Step 4: Configure Environment Variables in Vercel

In your Vercel project, go to **Settings > Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `SENTRY_DSN` | Sentry DSN (optional) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL |
| `CRON_SECRET` | Random secret for cron authentication |

### Step 5: Deploy

```bash
npx vercel --prod
```

### Cron Job Configuration

The `vercel.json` already configures the daily cost sync cron:
```json
{
  "crons": [{ "path": "/api/cron/sync-costs", "schedule": "0 0 * * *" }]
}
```

Vercel will call this with a `x-vercel-cron` header. Update your cron handler to verify this header in production.

### Custom Domain Setup

1. Go to **Vercel > Your Project > Settings > Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Troubleshooting

- **Build fails**: Check all required env vars are set
- **Auth not working**: Verify Supabase URL and anon key, check site URL in Supabase Auth settings
- **Stripe webhooks failing**: Verify webhook secret and endpoint URL
- **Costs not syncing**: Check cloud account credentials and cron secret