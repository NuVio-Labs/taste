import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { attachStripeCustomerToUser, findProfileByUserId } from "../_shared/billing.ts";
import { getAppUrl, getStripeClient, getStripePriceId } from "../_shared/stripe.ts";

function errorDetails(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (req) => {
  console.log("[checkout] function entered");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const headerKeys = [...req.headers.keys()];
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    console.log("[checkout] request header keys:", headerKeys);
    console.log("[checkout] auth header present:", Boolean(authHeader));

    if (!authHeader) {
      console.log("[checkout] bearer valid:", false);
      return jsonResponse(
        { error: "Unauthorized", stage: "missing-auth-header" },
        { status: 401 },
      );
    }

    const hasBearerPrefix = authHeader.startsWith("Bearer ");
    console.log("[checkout] bearer valid:", hasBearerPrefix);

    if (!hasBearerPrefix) {
      console.log("[checkout] missing or malformed Authorization header");
      return jsonResponse(
        { error: "Unauthorized", stage: "invalid-bearer-format" },
        { status: 401 },
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    console.log("[checkout] token length:", token.length);
    console.log("[checkout] token parts count:", token.split(".").length);
    console.log("[checkout] token startsWith('ey'):", token.startsWith("ey"));

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
      console.log("[checkout] getUser error:", userError.message);
      return jsonResponse(
        { error: "Unauthorized", stage: "get-user-failed", details: userError.message },
        { status: 401 },
      );
    }

    if (!user) {
      console.log("[checkout] getUser returned null user");
      return jsonResponse(
        { error: "Unauthorized", stage: "user-missing" },
        { status: 401 },
      );
    }

    console.log("[checkout] resolved user id:", user.id);
    console.log("[checkout] next stage: profile lookup");

    let profile;
    try {
      profile = await findProfileByUserId(user.id);
    } catch (error) {
      const details = errorDetails(error);
      console.log("[checkout] profile lookup failed:", details);
      return jsonResponse(
        { error: "Checkout creation failed", stage: "profile-lookup-failed", details },
        { status: 500 },
      );
    }

    console.log("[checkout] next stage: billing check");
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
        console.log("[checkout] created stripe customer:", customerId);
      } catch (error) {
        const details = errorDetails(error);
        console.log("[checkout] billing check failed:", details);
        return jsonResponse(
          { error: "Checkout creation failed", stage: "billing-check-failed", details },
          { status: 500 },
        );
      }
    } else {
      console.log("[checkout] existing stripe customer:", customerId);
    }

    const appUrl = getAppUrl();
    console.log("[checkout] next stage: stripe session create");

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

      console.log("[checkout] session created:", session.id);
      return jsonResponse({ url: session.url });
    } catch (error) {
      const details = errorDetails(error);
      console.log("[checkout] stripe session create failed:", details);
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
