import Stripe from "https://esm.sh/stripe@18.3.0?target=deno";
import {
  attachStripeCustomerToUser,
  mapSubscriptionToProfileUpdate,
  markProfileBillingInactiveByCustomerId,
  syncSubscriptionToProfile,
} from "../_shared/billing.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getStripeClient, getStripeWebhookSecret } from "../_shared/stripe.ts";

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const userId = session.metadata?.supabase_user_id ?? null;

  if (userId && customerId) {
    await attachStripeCustomerToUser(userId, customerId);
  }

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log("[webhook] subscription status:", subscription.status);
    if (customerId) {
      const profileUpdate = mapSubscriptionToProfileUpdate(subscription, customerId);
      if (profileUpdate) {
        console.log("[webhook] profile update:", profileUpdate);
      } else {
        console.log("[webhook] skipped profile sync for subscription status:", subscription.status);
      }
    }
    const syncedUserId = await syncSubscriptionToProfile(subscription, customerId);
    console.log("[webhook] user id:", syncedUserId);
  }
}

async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("[webhook] subscription status:", subscription.status);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  if (customerId) {
    const profileUpdate = mapSubscriptionToProfileUpdate(subscription, customerId);
    if (profileUpdate) {
      console.log("[webhook] profile update:", profileUpdate);
    } else {
      console.log("[webhook] skipped profile sync for subscription status:", subscription.status);
    }
  }
  const syncedUserId = await syncSubscriptionToProfile(subscription);
  console.log("[webhook] user id:", syncedUserId);
}

async function handleInvoicePaymentFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  if (!subscriptionId) {
    const customerId =
      typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
    if (customerId) {
      await markProfileBillingInactiveByCustomerId(customerId);
    }
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("[webhook] subscription status:", subscription.status);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  if (customerId) {
    const profileUpdate = mapSubscriptionToProfileUpdate(subscription, customerId);
    if (profileUpdate) {
      console.log("[webhook] profile update:", profileUpdate);
    } else {
      console.log("[webhook] skipped profile sync for subscription status:", subscription.status);
    }
  }
  const syncedUserId = await syncSubscriptionToProfile(subscription);
  console.log("[webhook] user id:", syncedUserId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return jsonResponse({ error: "Missing Stripe signature." }, { status: 400 });
    }

    const body = await req.text();
    const stripe = getStripeClient();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      getStripeWebhookSecret(),
    );

    console.log("[webhook] event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(stripe, event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[webhook] subscription status:", subscription.status);
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null;
        if (customerId) {
          const profileUpdate = mapSubscriptionToProfileUpdate(subscription, customerId);
          if (profileUpdate) {
            console.log("[webhook] profile update:", profileUpdate);
          } else {
            console.log("[webhook] skipped profile sync for subscription status:", subscription.status);
          }
        }
        const syncedUserId = await syncSubscriptionToProfile(subscription);
        console.log("[webhook] user id:", syncedUserId);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[webhook] subscription status:", subscription.status);
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null;
        if (customerId) {
          const profileUpdate = mapSubscriptionToProfileUpdate(subscription, customerId);
          if (profileUpdate) {
            console.log("[webhook] profile update:", profileUpdate);
          } else {
            console.log("[webhook] skipped profile sync for subscription status:", subscription.status);
          }
        }

        if (customerId) {
          const syncedUserId = await markProfileBillingInactiveByCustomerId(customerId);
          console.log("[webhook] user id:", syncedUserId);
        }
        break;
      }
      default:
        break;
    }

    return jsonResponse({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handling failed.";
    return jsonResponse({ error: message }, { status: 400 });
  }
});
