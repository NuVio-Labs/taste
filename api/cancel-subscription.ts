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
    apiVersion: "2025-02-24.acacia" as Parameters<typeof Stripe>[1]["apiVersion"],
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

  // Verify user via Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Verify JWT with Supabase
  const anonClient = createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_ANON_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Look up profile
  const admin = getAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  if (!profile?.stripe_subscription_id) {
    return res.status(400).json({ error: "Kein aktives Abonnement gefunden." });
  }

  try {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      { cancel_at_period_end: true },
    );

    // Sync cancel_at_period_end back to profile
    await admin
      .from("profiles")
      .update({
        cancel_at_period_end: true,
        cancel_at: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : null,
      })
      .eq("id", user.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kündigung fehlgeschlagen.";
    return res.status(500).json({ error: message });
  }
}
