# Uriyel Client Console v1 — Supabase Setup

This project runs in two modes:

- **Demo mode**: no Supabase environment variables; the UI uses local mock data.
- **Live mode**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present; the app requires Supabase Auth and loads guests/events from the database.

## 1. Create the Supabase project

Create a new Supabase project, then open **Project Settings → API** and copy:

- Project URL
- anon public key

Add them to `.env` locally:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

For Netlify, add the same values under:

```txt
Site configuration → Environment variables
```

## 2. Run the schema

Open Supabase:

```txt
SQL Editor → New query
```

Paste and run:

```txt
supabase/schema_v1.sql
```

This creates the multi-client data model:

- clients
- client_members
- events
- guest_profiles
- orders
- passes
- checkins
- sponsor_partners
- sponsor_perks
- perk_redemptions

It also enables Row Level Security and adds client/member policies.

## 3. Create your first owner user

Start the app and use the sign-up screen, or create a user in:

```txt
Authentication → Users → Add user
```

Use your real login email.

## 4. Run the Sharkbeams seed data

Open:

```txt
supabase/seed_sharkbeams_v1.sql
```

Replace:

```sql
v_owner_email text := 'REPLACE_WITH_YOUR_SUPABASE_LOGIN_EMAIL';
```

with your Supabase login email, then run the file in the Supabase SQL Editor.

This creates:

- Sharkbeams client
- first event
- your owner membership
- sample guests
- sample orders
- sample passes
- sample check-ins
- sponsor partners
- sponsor perks
- sample redemptions

## 5. Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL, sign in, and the console should load live Supabase data.

## 6. Deploy to Netlify

Build:

```bash
npm run build
```

Deploy the `dist` folder to Netlify.

Then add the environment variables in Netlify and redeploy.

## Important security note

Only use the Supabase anon/public key in the frontend.

Never place these in `.env` for Vite:

- Supabase service role key
- Stripe secret key
- Stripe webhook secret

Those belong only in Netlify Functions or secure server-side environments.
