import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { findProfileByUserId } from "../_shared/billing.ts";
import { getAppUrl, getStripeClient } from "../_shared/stripe.ts";

function errorDetails(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (req) => {
  console.log("[portal] function entered");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const headerKeys = [...req.headers.keys()];
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    console.log("[portal] request header keys:", headerKeys);
    console.log("[portal] auth header present:", Boolean(authHeader));

    if (!authHeader) {
      console.log("[portal] bearer valid:", false);
      return jsonResponse(
        { error: "Unauthorized", stage: "missing-auth-header" },
        { status: 401 },
      );
    }

    const hasBearerPrefix = authHeader.startsWith("Bearer ");
    console.log("[portal] bearer valid:", hasBearerPrefix);

    if (!hasBearerPrefix) {
      console.log("[portal] missing or malformed Authorization header");
      return jsonResponse(
        { error: "Unauthorized", stage: "invalid-bearer-format" },
        { status: 401 },
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    console.log("[portal] token length:", token.length);
    console.log("[portal] token parts count:", token.split(".").length);
    console.log("[portal] token startsWith('ey'):", token.startsWith("ey"));

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
      console.log("[portal] getUser error:", userError.message);
      return jsonResponse(
        { error: "Unauthorized", stage: "get-user-failed", details: userError.message },
        { status: 401 },
      );
    }

    if (!user) {
      console.log("[portal] getUser returned null user");
      return jsonResponse(
        { error: "Unauthorized", stage: "user-missing" },
        { status: 401 },
      );
    }

    console.log("[portal] resolved user id:", user.id);
    console.log("[portal] next stage: profile lookup");

    let profile;
    try {
      profile = await findProfileByUserId(user.id);
    } catch (error) {
      const details = errorDetails(error);
      console.log("[portal] profile lookup failed:", details);
      return jsonResponse(
        { error: "Portal creation failed", stage: "profile-lookup-failed", details },
        { status: 500 },
      );
    }

    console.log("[portal] next stage: billing check");

    if (!profile?.stripe_customer_id) {
      return jsonResponse(
        {
          error: "Portal creation failed",
          stage: "billing-check-failed",
          details: "No Stripe customer found for this user.",
        },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    console.log("[portal] next stage: stripe session create");

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${getAppUrl()}/profile?portal=return`,
      });

      console.log("[portal] portal session created");
      return jsonResponse({ url: session.url });
    } catch (error) {
      const details = errorDetails(error);
      console.log("[portal] stripe session create failed:", details);
      return jsonResponse(
        { error: "Portal creation failed", stage: "stripe-session-create-failed", details },
        { status: 500 },
      );
    }
  } catch (error) {
    const details = errorDetails(error);
    console.error("[portal] unexpected error:", details);
    return jsonResponse(
      { error: "Portal creation failed", stage: "unexpected-error", details },
      { status: 500 },
    );
  }
});
