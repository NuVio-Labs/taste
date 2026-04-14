import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { attachStripeCustomerToUser, findProfileByUserId } from "../_shared/billing.ts";
import { getAppUrl, getStripeClient, getStripePriceId } from "../_shared/stripe.ts";

function errorDetails(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        { error: "Unauthorized", stage: "missing-auth-header" },
        { status: 401 },
      );
    }

    const hasBearerPrefix = authHeader.startsWith("Bearer ");

    if (!hasBearerPrefix) {
      return jsonResponse(
        { error: "Unauthorized", stage: "invalid-bearer-format" },
        { status: 401 },
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return jsonResponse(
        { error: "Unauthorized", stage: "missing-token" },
        { status: 401 },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables for auth.");
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError) {
      return jsonResponse(
        { error: "Unauthorized", stage: "get-user-failed", details: userError.message },
        { status: 401 },
      );
    }

    if (!user) {
      return jsonResponse(
        { error: "Unauthorized", stage: "user-missing" },
        { status: 401 },
      );
    }

    let profile;
    try {
      profile = await findProfileByUserId(user.id);
    } catch (error) {
      const details = errorDetails(error);
      return jsonResponse(
        { error: "Checkout creation failed", stage: "profile-lookup-failed", details },
        { status: 500 },
      );
    }

    const stripe = getStripeClient();
    let customerId = profile?.stripe_customer_id ?? null;

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
        await attachStripeCustomerToUser(user.id, customerId);
      } catch (error) {
        const details = errorDetails(error);
        return jsonResponse(
          { error: "Checkout creation failed", stage: "billing-check-failed", details },
          { status: 500 },
        );
      }
    }

    const appUrl = getAppUrl();

    try {
      const session = await stripe.checkout.sessions.create({
        allow_promotion_codes: true,
        cancel_url: `${appUrl}/profile`,
        customer: customerId,
        line_items: [{ price: getStripePriceId(), quantity: 1 }],
        metadata: { supabase_user_id: user.id },
        mode: "subscription",
        subscription_data: { metadata: { supabase_user_id: user.id } },
        success_url: `${appUrl}/profile?checkout=success`,
      });

      if (!session.url) {
        throw new Error("Stripe checkout session URL is missing.");
      }

      return jsonResponse({ url: session.url });
    } catch (error) {
      const details = errorDetails(error);
      return jsonResponse(
        { error: "Checkout creation failed", stage: "stripe-session-create-failed", details },
        { status: 500 },
      );
    }
  } catch (error) {
    const details = errorDetails(error);
    console.error("[checkout] unexpected error:", details);
    return jsonResponse(
      { error: "Checkout creation failed", stage: "unexpected-error", details },
      { status: 500 },
    );
  }
});
