-- Uriyel Client Console v1 — Sharkbeams seed data
-- 1) Create/sign up your first Supabase Auth user in the app or Supabase Dashboard.
-- 2) Replace the email below with that Auth user's email.
-- 3) Run this file in Supabase SQL Editor after schema_v1.sql.

DO $$
DECLARE
  v_owner_email text := 'REPLACE_WITH_YOUR_SUPABASE_LOGIN_EMAIL';
  v_owner_user_id uuid;
  v_client_id uuid;
  v_event_id uuid;
  v_snow_peak_id uuid;
  v_suntory_id uuid;
  v_private_partner_id uuid;
  v_snow_peak_perk_id uuid;
  v_suntory_perk_id uuid;
  v_private_perk_id uuid;
  v_aiko_id uuid;
  v_james_id uuid;
  v_mina_id uuid;
  v_daniel_id uuid;
  v_elena_id uuid;
  v_aiko_pass_id uuid;
  v_mina_pass_id uuid;
  v_elena_pass_id uuid;
BEGIN
  SELECT id INTO v_owner_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_owner_email)
  LIMIT 1;

  IF v_owner_user_id IS NULL THEN
    RAISE EXCEPTION 'No Supabase Auth user found for email: %', v_owner_email;
  END IF;

  INSERT INTO public.clients (name, slug, website)
  VALUES ('Sharkbeams', 'sharkbeams', 'https://sharkbeams.co')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, website = EXCLUDED.website
  RETURNING id INTO v_client_id;

  INSERT INTO public.client_members (client_id, user_id, role)
  VALUES (v_client_id, v_owner_user_id, 'owner')
  ON CONFLICT (client_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.events (client_id, name, location, starts_at, ends_at, capacity, status)
  VALUES (
    v_client_id,
    'Private Release — Fukuoka',
    'Karadomari Village, Fukuoka',
    '2026-10-10 17:00:00+09',
    '2026-10-10 23:30:00+09',
    250,
    'Console v1'
  )
  RETURNING id INTO v_event_id;

  INSERT INTO public.guest_profiles (client_id, event_id, full_name, email, phone, tier, payment_status, sponsor_source, notes)
  VALUES
    (v_client_id, v_event_id, 'Aiko Tanaka', 'aiko@example.com', '+81 90 0000 1001', 'VIP Dinner', 'paid', 'Snow Peak', 'Priority arrival. Vegetarian dinner preference.')
  RETURNING id INTO v_aiko_id;

  INSERT INTO public.guest_profiles (client_id, event_id, full_name, email, phone, tier, payment_status, sponsor_source, notes)
  VALUES
    (v_client_id, v_event_id, 'James Mori', 'james@example.com', '+44 7700 900202', 'Glamping', 'deposit_paid', null, 'Balance payment required before pass activation.')
  RETURNING id INTO v_james_id;

  INSERT INTO public.guest_profiles (client_id, event_id, full_name, email, phone, tier, payment_status, sponsor_source, notes)
  VALUES
    (v_client_id, v_event_id, 'Mina Sato', 'mina@example.com', '+81 90 0000 1003', 'Founder Guest', 'comped', 'Suntory', 'Founder allocation. Include in sponsor lounge list.')
  RETURNING id INTO v_mina_id;

  INSERT INTO public.guest_profiles (client_id, event_id, full_name, email, phone, tier, payment_status, sponsor_source, notes)
  VALUES
    (v_client_id, v_event_id, 'Daniel Cho', 'daniel@example.com', '+852 6000 1004', 'General Access', 'unpaid', null, 'Invite accepted. Payment link not completed.')
  RETURNING id INTO v_daniel_id;

  INSERT INTO public.guest_profiles (client_id, event_id, full_name, email, phone, tier, payment_status, sponsor_source, notes)
  VALUES
    (v_client_id, v_event_id, 'Elena Wada', 'elena@example.com', '+81 80 0000 1005', 'Sponsor Guest', 'allocated', 'Private Partner', 'Partner allocation. No payment required.')
  RETURNING id INTO v_elena_id;

  INSERT INTO public.orders (client_id, event_id, guest_id, product_name, amount_gbp, status, metadata)
  VALUES
    (v_client_id, v_event_id, v_aiko_id, 'VIP Dinner', 480, 'paid', '{"source":"seed"}'::jsonb),
    (v_client_id, v_event_id, v_james_id, 'Glamping Deposit', 220, 'paid', '{"source":"seed"}'::jsonb),
    (v_client_id, v_event_id, v_daniel_id, 'General Access', 180, 'created', '{"source":"seed"}'::jsonb);

  INSERT INTO public.passes (client_id, event_id, guest_id, tier, status, issued_at, activated_at)
  VALUES (v_client_id, v_event_id, v_aiko_id, 'VIP Dinner', 'issued', now(), now())
  RETURNING id INTO v_aiko_pass_id;

  INSERT INTO public.passes (client_id, event_id, guest_id, tier, status, issued_at)
  VALUES (v_client_id, v_event_id, v_james_id, 'Glamping', 'reserved', now());

  INSERT INTO public.passes (client_id, event_id, guest_id, tier, status, issued_at, activated_at)
  VALUES (v_client_id, v_event_id, v_mina_id, 'Founder Guest', 'issued', now(), now())
  RETURNING id INTO v_mina_pass_id;

  INSERT INTO public.passes (client_id, event_id, guest_id, tier, status, issued_at, activated_at)
  VALUES (v_client_id, v_event_id, v_elena_id, 'Sponsor Guest', 'issued', now(), now())
  RETURNING id INTO v_elena_pass_id;

  INSERT INTO public.checkins (client_id, event_id, pass_id, guest_id, checked_in_by, method, notes)
  VALUES
    (v_client_id, v_event_id, v_aiko_pass_id, v_aiko_id, v_owner_user_id, 'qr_scan', 'Seed check-in'),
    (v_client_id, v_event_id, v_mina_pass_id, v_mina_id, v_owner_user_id, 'qr_scan', 'Seed check-in');

  INSERT INTO public.sponsor_partners (client_id, event_id, name, contact_email, allocation_limit)
  VALUES (v_client_id, v_event_id, 'Snow Peak', 'partnerships@example.com', 24)
  RETURNING id INTO v_snow_peak_id;

  INSERT INTO public.sponsor_partners (client_id, event_id, name, contact_email, allocation_limit)
  VALUES (v_client_id, v_event_id, 'Suntory', 'sponsor@example.com', 80)
  RETURNING id INTO v_suntory_id;

  INSERT INTO public.sponsor_partners (client_id, event_id, name, contact_email, allocation_limit)
  VALUES (v_client_id, v_event_id, 'Private Partner', 'partner@example.com', 12)
  RETURNING id INTO v_private_partner_id;

  INSERT INTO public.sponsor_perks (client_id, event_id, sponsor_id, name, description, issue_limit)
  VALUES (v_client_id, v_event_id, v_snow_peak_id, 'VIP lounge allocation', 'High-intent outdoor/lifestyle audience proof', 24)
  RETURNING id INTO v_snow_peak_perk_id;

  INSERT INTO public.sponsor_perks (client_id, event_id, sponsor_id, name, description, issue_limit)
  VALUES (v_client_id, v_event_id, v_suntory_id, 'Afterglow drinks token', 'On-site product interaction and redemption data', 80)
  RETURNING id INTO v_suntory_perk_id;

  INSERT INTO public.sponsor_perks (client_id, event_id, sponsor_id, name, description, issue_limit)
  VALUES (v_client_id, v_event_id, v_private_partner_id, 'Founder table access', 'VIP hospitality allocation and attendance proof', 12)
  RETURNING id INTO v_private_perk_id;

  INSERT INTO public.perk_redemptions (client_id, event_id, sponsor_perk_id, guest_id, pass_id, redeemed_by, notes)
  VALUES
    (v_client_id, v_event_id, v_snow_peak_perk_id, v_aiko_id, v_aiko_pass_id, v_owner_user_id, 'Seed redemption'),
    (v_client_id, v_event_id, v_suntory_perk_id, v_mina_id, v_mina_pass_id, v_owner_user_id, 'Seed redemption'),
    (v_client_id, v_event_id, v_private_perk_id, v_elena_id, v_elena_pass_id, v_owner_user_id, 'Seed redemption');
END $$;
