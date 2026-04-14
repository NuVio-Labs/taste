import type Stripe from "https://esm.sh/stripe@18.3.0?target=deno";
import {
  attachStripeCustomerToUser,
  mapSubscriptionToProfileUpdate,
  markProfileBillingInactiveByCustomerId,
  syncSubscriptionToProfile,
} from "../_shared/billing.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getStripeClient, getStripeWebhookSecret } from "../_shared/stripe.ts";

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
) {
  return typeof customer === "string" ? customer : customer?.id ?? null;
}

function logSubscriptionDecision(_eventType: string, subscription: Stripe.Subscription) {
  const customerId = getCustomerId(subscription.customer);

  if (!customerId) {
    return { customerId: null, profileUpdate: null };
  }

  const profileUpdate = mapSubscriptionToProfileUpdate(subscription, customerId);

  return { customerId, profileUpdate };
}

async function syncSubscriptionEvent(
  _eventType: string,
  subscription: Stripe.Subscription,
  fallbackCustomerId?: string | null,
) {
  const { customerId } = logSubscriptionDecision(_eventType, subscription);
  const syncedUserId = await syncSubscriptionToProfile(subscription, fallbackCustomerId ?? customerId);
  return syncedUserId;
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const customerId = getCustomerId(session.customer);
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
    await syncSubscriptionEvent("checkout.session.completed", subscription, customerId);
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
  await syncSubscriptionEvent("invoice.paid", subscription);
}

async function handleInvoicePaymentFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  if (!subscriptionId) {
    const customerId = getCustomerId(invoice.customer);
    if (customerId) {
      await markProfileBillingInactiveByCustomerId(customerId);
    }
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscriptionEvent("invoice.payment_failed", subscription);
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
        await syncSubscriptionEvent(event.type, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { customerId } = logSubscriptionDecision(event.type, subscription);

        if (customerId) {
          await markProfileBillingInactiveByCustomerId(customerId);
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
