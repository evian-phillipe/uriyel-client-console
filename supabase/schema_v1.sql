-- Uriyel Client Console v1 — Supabase schema starter
-- Run this in the Supabase SQL editor after creating a new project.
-- Day 2 target: multi-tenant client/event data with RLS foundations.

create extension if not exists pgcrypto;

create type public.uriyel_role as enum ('owner', 'client_admin', 'staff', 'sponsor_viewer');
create type public.payment_status as enum ('unpaid', 'deposit_paid', 'paid', 'comped', 'allocated', 'refunded');
create type public.pass_status as enum ('not_issued', 'reserved', 'issued', 'activated', 'checked_in', 'voided');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.uriyel_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (client_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guest_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  tier text not null default 'General Access',
  payment_status public.payment_status not null default 'unpaid',
  sponsor_source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, email)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid references public.guest_profiles(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  product_name text not null,
  amount_gbp numeric(10,2) not null default 0,
  status text not null default 'created',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.passes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid not null references public.guest_profiles(id) on delete cascade,
  pass_code text not null unique default encode(gen_random_bytes(18), 'hex'),
  tier text not null,
  status public.pass_status not null default 'not_issued',
  issued_at timestamptz,
  activated_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, guest_id)
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  pass_id uuid not null references public.passes(id) on delete cascade,
  guest_id uuid not null references public.guest_profiles(id) on delete cascade,
  checked_in_by uuid references auth.users(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  method text not null default 'qr_scan',
  notes text
);

create table public.sponsor_partners (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  contact_email text,
  allocation_limit integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sponsor_perks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  sponsor_id uuid not null references public.sponsor_partners(id) on delete cascade,
  name text not null,
  description text,
  issue_limit integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  sponsor_perk_id uuid not null references public.sponsor_perks(id) on delete cascade,
  guest_id uuid not null references public.guest_profiles(id) on delete cascade,
  pass_id uuid references public.passes(id) on delete set null,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  notes text
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger set_events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger set_guest_profiles_updated_at before update on public.guest_profiles for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_passes_updated_at before update on public.passes for each row execute function public.set_updated_at();
create trigger set_sponsor_partners_updated_at before update on public.sponsor_partners for each row execute function public.set_updated_at();
create trigger set_sponsor_perks_updated_at before update on public.sponsor_perks for each row execute function public.set_updated_at();

create or replace function public.is_client_member(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_members cm
    where cm.client_id = target_client_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.has_client_role(target_client_id uuid, allowed_roles public.uriyel_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_members cm
    where cm.client_id = target_client_id
      and cm.user_id = auth.uid()
      and cm.role = any(allowed_roles)
  );
$$;

alter table public.clients enable row level security;
alter table public.client_members enable row level security;
alter table public.events enable row level security;
alter table public.guest_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.passes enable row level security;
alter table public.checkins enable row level security;
alter table public.sponsor_partners enable row level security;
alter table public.sponsor_perks enable row level security;
alter table public.perk_redemptions enable row level security;

-- Membership visibility
create policy "members can view their client memberships"
  on public.client_members for select
  using (user_id = auth.uid() or public.is_client_member(client_id));

create policy "owners and admins can manage client memberships"
  on public.client_members for all
  using (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]));

-- Generic client-scoped visibility and mutation policies
create policy "members can view clients"
  on public.clients for select
  using (public.is_client_member(id));

create policy "owners and admins can update clients"
  on public.clients for update
  using (public.has_client_role(id, array['owner', 'client_admin']::public.uriyel_role[]))
  with check (public.has_client_role(id, array['owner', 'client_admin']::public.uriyel_role[]));

create policy "members can view events"
  on public.events for select
  using (public.is_client_member(client_id));

create policy "owners and admins can manage events"
  on public.events for all
  using (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]));

create policy "members can view guests"
  on public.guest_profiles for select
  using (public.is_client_member(client_id));

create policy "owners admins and staff can manage guests"
  on public.guest_profiles for all
  using (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]));

create policy "members can view orders"
  on public.orders for select
  using (public.is_client_member(client_id));

create policy "owners and admins can manage orders"
  on public.orders for all
  using (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]));

create policy "members can view passes"
  on public.passes for select
  using (public.is_client_member(client_id));

create policy "owners admins and staff can manage passes"
  on public.passes for all
  using (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]));

create policy "members can view checkins"
  on public.checkins for select
  using (public.is_client_member(client_id));

create policy "owners admins and staff can insert checkins"
  on public.checkins for insert
  with check (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]));

create policy "members can view sponsor partners"
  on public.sponsor_partners for select
  using (public.is_client_member(client_id));

create policy "owners and admins can manage sponsor partners"
  on public.sponsor_partners for all
  using (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin']::public.uriyel_role[]));

create policy "members can view sponsor perks"
  on public.sponsor_perks for select
  using (public.is_client_member(client_id));

create policy "owners admins and staff can manage sponsor perks"
  on public.sponsor_perks for all
  using (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]))
  with check (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]));

create policy "members can view perk redemptions"
  on public.perk_redemptions for select
  using (public.is_client_member(client_id));

create policy "owners admins and staff can insert perk redemptions"
  on public.perk_redemptions for insert
  with check (public.has_client_role(client_id, array['owner', 'client_admin', 'staff']::public.uriyel_role[]));

-- Helpful indexes
create index idx_client_members_user_id on public.client_members(user_id);
create index idx_events_client_id on public.events(client_id);
create index idx_guest_profiles_event_id on public.guest_profiles(event_id);
create index idx_orders_event_id on public.orders(event_id);
create index idx_orders_stripe_checkout_session_id on public.orders(stripe_checkout_session_id);
create index idx_passes_event_id on public.passes(event_id);
create index idx_passes_pass_code on public.passes(pass_code);
create index idx_checkins_event_id on public.checkins(event_id);
create index idx_sponsor_perks_event_id on public.sponsor_perks(event_id);
create index idx_perk_redemptions_event_id on public.perk_redemptions(event_id);

-- API grants for Supabase Auth users. RLS policies still control the rows each user can access.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
grant execute on function public.is_client_member(uuid) to authenticated;
grant execute on function public.has_client_role(uuid, public.uriyel_role[]) to authenticated;
