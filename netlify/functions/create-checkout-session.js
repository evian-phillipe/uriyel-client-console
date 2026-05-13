import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const productMap = {
  general_access: {
    name: "General Access",
    amount_gbp: 180,
    mode: "payment",
  },
  vip_dinner: {
    name: "VIP Dinner",
    amount_gbp: 480,
    mode: "payment",
  },
  glamping_deposit: {
    name: "Glamping Deposit",
    amount_gbp: 220,
    mode: "payment",
  },
  glamping_balance: {
    name: "Glamping Balance",
    amount_gbp: 260,
    mode: "payment",
  },
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { guest_id, event_id, client_id, product_key } = body;

    if (!guest_id || !event_id || !client_id || !product_key) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing required fields: guest_id, event_id, client_id, product_key",
        }),
      };
    }

    const product = productMap[product_key];

    if (!product) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid product_key" }),
      };
    }

    const { data: guest, error: guestError } = await supabaseAdmin
      .from("guest_profiles")
      .select("id, full_name, email, tier")
      .eq("id", guest_id)
      .single();

    if (guestError || !guest) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Guest not found" }),
      };
    }

    const siteUrl = process.env.SITE_URL || "http://localhost:8888";
    const amountPence = Math.round(Number(product.amount_gbp) * 100);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        client_id,
        event_id,
        guest_id,
        product_name: product.name,
        amount_gbp: product.amount_gbp,
        status: "created",
        metadata: {
          product_key,
          source: "stripe_checkout",
        },
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Could not create Uriyel order" }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: guest.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Uriyel — ${product.name}`,
              description: guest.full_name ? `Guest: ${guest.full_name}` : undefined,
            },
            unit_amount: amountPence,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/access?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/guests?payment=cancelled`,
      metadata: {
        order_id: order.id,
        guest_id,
        event_id,
        client_id,
        product_key,
      },
    });

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        metadata: {
          product_key,
          source: "stripe_checkout",
          checkout_url: session.url,
        },
      })
      .eq("id", order.id);

    if (updateError) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Could not attach Stripe session to order" }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        url: session.url,
        session_id: session.id,
        order_id: order.id,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message || "Checkout session failed",
      }),
    };
  }
};
