# Uriyel Day 5–7 Stripe / Webhook / QR Patch

Copy the contents of this patch into your current Uriyel project folder.

Expected project folder:

```bash
/home/miykael/Projects/uriyel-client-console-v1-live-supabase-source(1)
```

## Terminal apply method

If this ZIP is in your Downloads folder:

```bash
cd "/home/miykael/Projects/uriyel-client-console-v1-live-supabase-source(1)"
rm -rf /tmp/uriyel-day5-7-patch
unzip ~/Downloads/uriyel-day5-7-stripe-qr-fresh-patch.zip -d /tmp/uriyel-day5-7-patch
cp -r /tmp/uriyel-day5-7-patch/* .
```

Then install the required packages:

```bash
npm install stripe qrcode @netlify/functions
```

Check that the functions exist:

```bash
ls netlify/functions
```

You should see:

```txt
create-checkout-session.js
stripe-webhook.js
```

## Supabase migration

Run this in Supabase SQL Editor:

```txt
supabase/migration_02_payments_qr.sql
```

## Required environment variables

Keep existing frontend variables:

```bash
VITE_SUPABASE_URL=https://qahlvtwffigasjqrfmsw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Add server-only variables in Netlify Environment Variables:

```bash
SUPABASE_URL=https://qahlvtwffigasjqrfmsw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_or_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://console-uriyel.netlify.app
```

Do not commit service role or Stripe keys to GitHub.

## Build, commit, push

```bash
npm run build
git add .
git commit -m "Add Stripe checkout webhook and QR pass flow"
git push
```

Netlify should auto-deploy from GitHub.
