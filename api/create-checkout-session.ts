import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function getStripeClient() {
  return new Stripe(getEnv("STRIPE_SECRET_KEY"), {
    appInfo: { name: "NuVio Taste" },
    apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  });
}

function getAdminClient() {
  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  const anonClient = createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_ANON_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const admin = getAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_customer_id, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  try {
    const stripe = getStripeClient();
    const appUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: getEnv("STRIPE_PRICE_ID"),
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
      },
      allow_promotion_codes: true,
    };

    // Re-use existing Stripe customer if available
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout konnte nicht erstellt werden.";
    console.error("[create-checkout-session]", message);
    return res.status(500).json({ error: message });
  }
}
