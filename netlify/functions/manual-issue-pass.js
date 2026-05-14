import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getUserFromBearerToken(supabase, authorizationHeader = '') {
  const token = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data?.user || null;
}

async function assertClientMember(supabase, { clientId, userId }) {
  const { data, error } = await supabase
    .from('client_members')
    .select('role')
    .eq('client_id', clientId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('User is not a member of this client.');
  return data;
}

function createPassCode() {
  return `URIYEL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

function getManualProduct({ productKey, guest }) {
  const normalized = String(productKey || '').trim();

  const products = {
    general_access: {
      name: 'General Access',
      amountGbp: 180,
      paymentStatus: 'paid',
      passStatus: 'issued',
      tier: 'General Access',
    },
    vip_dinner: {
      name: 'VIP Dinner',
      amountGbp: 480,
      paymentStatus: 'paid',
      passStatus: 'issued',
      tier: 'VIP Dinner',
    },
    glamping_deposit: {
      name: 'Glamping Deposit',
      amountGbp: 220,
      paymentStatus: 'deposit_paid',
      passStatus: 'reserved',
      tier: 'Glamping',
    },
    glamping_balance: {
      name: 'Glamping Balance',
      amountGbp: 260,
      paymentStatus: 'paid',
      passStatus: 'issued',
      tier: 'Glamping',
    },
    sponsor_guest_allocation: {
      name: 'Sponsor Guest Allocation',
      amountGbp: 0,
      paymentStatus: 'allocated',
      passStatus: 'issued',
      tier: guest?.tier || 'Sponsor Guest',
    },
    comp_guest: {
      name: 'Comp Guest',
      amountGbp: 0,
      paymentStatus: 'comped',
      passStatus: 'issued',
      tier: guest?.tier || 'Founder Guest',
    },
  };

  if (products[normalized]) return products[normalized];

  const currentTier = String(guest?.tier || '').toLowerCase();
  const currentPayment = String(guest?.payment_status || '').toLowerCase();

  if (currentPayment === 'deposit_paid') return products.glamping_balance;
  if (currentTier.includes('vip')) return products.vip_dinner;
  if (currentTier.includes('glamping')) return products.glamping_deposit;
  if (currentTier.includes('sponsor')) return products.sponsor_guest_allocation;
  if (currentTier.includes('founder')) return products.comp_guest;
  return products.general_access;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const user = await getUserFromBearerToken(supabase, event.headers.authorization || '');

    if (!user) {
      return response(401, { error: 'You must be signed in to issue a pass.' });
    }

    const body = JSON.parse(event.body || '{}');
    const guestId = body.guestId;
    const productKey = body.productKey;

    if (!guestId) {
      return response(400, { error: 'Missing guestId.' });
    }

    const { data: guest, error: guestError } = await supabase
      .from('guest_profiles')
      .select('id, client_id, event_id, full_name, email, tier, payment_status, sponsor_source')
      .eq('id', guestId)
      .single();

    if (guestError || !guest) {
      return response(404, { error: 'Guest not found.' });
    }

    await assertClientMember(supabase, {
      clientId: guest.client_id,
      userId: user.id,
    });

    const product = getManualProduct({ productKey, guest });
    const now = new Date().toISOString();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: guest.client_id,
        event_id: guest.event_id,
        guest_id: guest.id,
        product_name: `Manual — ${product.name}`,
        amount_gbp: product.amountGbp,
        status: product.amountGbp > 0 ? 'paid' : 'allocated',
        paid_at: now,
        metadata: {
          source: 'manual_issue',
          product_key: productKey || null,
          issued_by: user.id,
          issued_by_email: user.email || null,
        },
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    const { data: existingPass, error: existingPassError } = await supabase
      .from('passes')
      .select('id, pass_code')
      .eq('guest_id', guest.id)
      .eq('event_id', guest.event_id)
      .maybeSingle();

    if (existingPassError) throw existingPassError;

    const passCode = existingPass?.pass_code || createPassCode();
    const siteUrl =
      process.env.SITE_URL ||
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      'http://localhost:8888';

    const passUrl = `${siteUrl.replace(/\/$/, '')}/pass/${passCode}`;

    const qrPayload = JSON.stringify({
      type: 'uriyel_pass',
      pass_code: passCode,
      guest_id: guest.id,
      event_id: guest.event_id,
      client_id: guest.client_id,
      status: product.passStatus,
    });

    const qrDataUrl = await QRCode.toDataURL(passUrl, {
      margin: 1,
      width: 640,
    });

    const passPayload = {
      client_id: guest.client_id,
      event_id: guest.event_id,
      guest_id: guest.id,
      tier: product.tier || guest.tier,
      status: product.passStatus,
      pass_code: passCode,
      pass_url: passUrl,
      qr_payload: qrPayload,
      qr_data_url: qrDataUrl,
      issued_at: now,
      activated_at: product.passStatus === 'issued' ? now : null,
      updated_at: now,
    };

    let savedPass;

    if (existingPass) {
      const { data, error } = await supabase
        .from('passes')
        .update(passPayload)
        .eq('id', existingPass.id)
        .select('id, pass_code, pass_url, status')
        .single();

      if (error) throw error;
      savedPass = data;
    } else {
      const { data, error } = await supabase
        .from('passes')
        .insert(passPayload)
        .select('id, pass_code, pass_url, status')
        .single();

      if (error) throw error;
      savedPass = data;
    }

    const { error: updateGuestError } = await supabase
      .from('guest_profiles')
      .update({
        payment_status: product.paymentStatus,
        tier: product.tier || guest.tier,
        updated_at: now,
      })
      .eq('id', guest.id);

    if (updateGuestError) throw updateGuestError;

    return response(200, {
      ok: true,
      order,
      pass: savedPass,
      message:
        product.passStatus === 'reserved'
          ? 'Deposit recorded and pass reserved.'
          : 'Manual payment confirmed and pass issued.',
    });
  } catch (error) {
    return response(500, {
      error: error.message || 'Manual issue failed.',
    });
  }
};
