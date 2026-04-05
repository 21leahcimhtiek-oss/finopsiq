# Vercel Deployment Guide

## Prerequisites

- Vercel account and CLI (`npm i -g vercel`)
- Supabase project created at supabase.com
- Stripe account with products created (run `node scripts/setup-stripe.js`)
- OpenAI API key
- Upstash Redis database
- Sentry project for error tracking

## Step 1: Database Setup

```bash
npx supabase db push --db-url postgresql://postgres:[password]@[host]:5432/postgres
```

## Step 2: Environment Variables

Set the following in Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
OPENAI_API_KEY=sk-...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
ENCRYPTION_KEY=<64-char hex>
SENTRY_DSN=https://...sentry.io/...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 3: Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy

```bash
vercel --prod
```

## Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/billing/webhook`  
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`  
4. Copy webhook secret to STRIPE_WEBHOOK_SECRET env var
