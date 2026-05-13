# Uriyel Client Console v1

Premium access, payments, guest CRM, pass verification and sponsor reporting console for Uriyel / AccessOS.

## Status

- Day 1: Console UI and routes complete
- Day 2: Supabase schema included
- Day 3 foundation: Supabase Auth and client roles wired into the frontend
- Live data: app loads events, guests, orders, passes, check-ins and sponsor redemptions from Supabase when environment variables are present

## Routes

```txt
/dashboard
/sales
/guests
/access
/sponsors
/settings
```

## Run locally

```bash
npm install
npm run dev
```

## Demo mode

Without Supabase environment variables, the app runs with mock Sharkbeams data.

## Live mode

Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

Then follow:

```txt
SUPABASE_SETUP.md
```

## Build

```bash
npm run build
```

The production output is generated in:

```txt
dist/
```
