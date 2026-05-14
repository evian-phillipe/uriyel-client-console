# Uriyel Manual Issue Pass Patch

This patch adds a non-Stripe flow:

Guest row → Manual action → order recorded → payment status updated → pass issued/reserved → QR generated.

## Apply

From your project folder:

```bash
cd "/home/miykael/Projects/uriyel-client-console-v1-live-supabase-source(1)"
rm -rf /tmp/uriyel-manual-issue-pass-patch
unzip ~/Downloads/uriyel-manual-issue-pass-patch.zip -d /tmp/uriyel-manual-issue-pass-patch
cp -r /tmp/uriyel-manual-issue-pass-patch/* .
```

## Install dependency

```bash
npm install qrcode
```

## Run migration in Supabase SQL Editor

Paste and run the contents of:

```txt
supabase/migration_02_payments_qr.sql
```

Do not paste the file path itself.

## Required Netlify variables

These must exist in Netlify environment variables:

```bash
VITE_SUPABASE_URL=https://qahlvtwffigasjqrfmsw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_URL=https://qahlvtwffigasjqrfmsw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_... or legacy service_role key
SITE_URL=https://console-uriyel.netlify.app
```

Stripe keys are not required for this manual flow.

## Test locally

Netlify Functions do not run under plain Vite. Use Netlify Dev:

```bash
npx netlify-cli dev
```

Open:

```txt
http://localhost:8888/guests
```

## Build and push

```bash
npm run build
git add .
git commit -m "Add manual issue pass and QR generation"
git push
```

Netlify will auto-deploy.
