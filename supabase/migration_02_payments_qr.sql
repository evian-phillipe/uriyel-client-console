-- Uriyel Client Console v1
-- Migration 02 — manual payment confirmation and QR pass fields

alter table public.orders
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

alter table public.passes
  add column if not exists pass_code text,
  add column if not exists pass_url text,
  add column if not exists qr_payload text,
  add column if not exists qr_data_url text;

create unique index if not exists passes_pass_code_key
  on public.passes (pass_code)
  where pass_code is not null;

create index if not exists orders_stripe_checkout_session_idx
  on public.orders (stripe_checkout_session_id);

create index if not exists passes_guest_event_idx
  on public.passes (guest_id, event_id);

update public.passes
set pass_code = 'URIYEL-' || upper(substr(replace(id::text, '-', ''), 1, 16))
where pass_code is null;
