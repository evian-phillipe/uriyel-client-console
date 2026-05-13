import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function createPassCode() {
  return `URIYEL-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

async function issueOrActivatePass({ client_id, event_id, guest_id, product_key }) {
  const siteUrl = process.env.SITE_URL || "http://localhost:8888";

  let status = "issued";
  let guestPaymentStatus = "paid";
  let tier = "General Access";

  if (product_key === "glamping_deposit") {
    status = "reserved";
    guestPaymentStatus = "deposit_paid";
    tier = "Glamping";
  }

  if (product_key === "glamping_balance") {
    status = "issued";
    guestPaymentStatus = "paid";
    tier = "Glamping";
  }

  if (product_key === "vip_dinner") {
    tier = "VIP Dinner";
  }

  const { data: existingPass } = await supabaseAdmin
    .from("passes")
    .select("id, pass_code")
    .eq("guest_id", guest_id)
    .eq("event_id", event_id)
    .maybeSingle();

  const passCode = existingPass?.pass_code || createPassCode();
  const passUrl = `${siteUrl}/pass/${passCode}`;
  const qrPayload = JSON.stringify({
    type: "uriyel_pass",
    pass_code: passCode,
    guest_id,
    event_id,
  });
  const qrDataUrl = await QRCode.toDataURL(passUrl, {
    margin: 1,
    width: 640,
  });

  if (existingPass) {
    const { error: updatePassError } = await supabaseAdmin
      .from("passes")
      .update({
        tier,
        status,
        activated_at: status === "issued" ? new Date().toISOString() : null,
        pass_url: passUrl,
        qr_payload: qrPayload,
        qr_data_url: qrDataUrl,
      })
      .eq("id", existingPass.id);

    if (updatePassError) throw updatePassError;
  } else {
    const { error: insertPassError } = await supabaseAdmin.from("passes").insert({
      client_id,
      event_id,
      guest_id,
      tier,
      status,
      pass_code: passCode,
      issued_at: new Date().toISOString(),
      activated_at: status === "issued" ? new Date().toISOString() : null,
      pass_url: passUrl,
      qr_payload: qrPayload,
      qr_data_url: qrDataUrl,
    });

    if (insertPassError) throw insertPassError;
  }

  const { error: guestError } = await supabaseAdmin
    .from("guest_profiles")
    .update({
      payment_status: guestPaymentStatus,
      tier,
    })
    .eq("id", guest_id);

  if (guestError) throw guestError;

  return { pass_code: passCode, pass_url: passUrl };
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  const signature = event.headers["stripe-signature"];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return {
      statusCode: 400,
      body: `Webhook signature verification failed: ${error.message}`,
    };
  }

  try {
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object;
      const {
        order_id,
        guest_id,
        event_id,
        client_id,
        product_key,
      } = session.metadata || {};

      if (!order_id || !guest_id || !event_id || !client_id) {
        return {
          statusCode: 400,
          body: "Missing Uriyel metadata on Stripe session",
        };
      }

      const { error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null,
          paid_at: new Date().toISOString(),
          metadata: {
            product_key,
            source: "stripe_webhook",
            stripe_customer: session.customer || null,
            stripe_payment_status: session.payment_status || null,
          },
        })
        .eq("id", order_id);

      if (orderError) throw orderError;

      await issueOrActivatePass({
        client_id,
        event_id,
        guest_id,
        product_key,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Webhook handling failed",
      }),
    };
  }
};
