import type Stripe from "https://esm.sh/stripe@18.3.0?target=deno";
import { createAdminClient } from "./supabase.ts";
import {
  toIsoFromUnix,
} from "./stripe.ts";

type ProfileBillingUpdate = {
  access_source?: "free" | "manual" | "stripe";
  billing_status: "inactive" | "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  current_period_end: string | null;
  plan: "free" | "pro";
  pro_source?: "free" | "manual" | "stripe";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

function isStripeProStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "unpaid":
      return true;
    default:
      return false;
  }
}

function mapSubscriptionToProfileBillingStatus(
  status: Stripe.Subscription.Status,
): ProfileBillingUpdate["billing_status"] {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
      return "canceled";
    default:
      return "inactive";
  }
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const subscriptionWithPeriodEnd = subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  };

  if (typeof subscriptionWithPeriodEnd.current_period_end === "number") {
    return toIsoFromUnix(subscriptionWithPeriodEnd.current_period_end);
  }

  const latestLineItem = subscription.items.data
    .slice()
    .sort((left, right) => (right.current_period_end ?? 0) - (left.current_period_end ?? 0))[0];

  return toIsoFromUnix(latestLineItem?.current_period_end);
}

export function mapSubscriptionToProfileUpdate(
  subscription: Stripe.Subscription,
  customerId: string,
): ProfileBillingUpdate | null {
  switch (subscription.status) {
    case "active":
    case "trialing":
    case "past_due":
    case "unpaid":
      return {
        access_source: "stripe",
        billing_status: mapSubscriptionToProfileBillingStatus(subscription.status),
        current_period_end: getSubscriptionPeriodEnd(subscription),
        plan: "pro",
        pro_source: "stripe",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
      };
    case "incomplete":
      return null;
    case "canceled":
    case "incomplete_expired":
      return {
        access_source: "free",
        billing_status: "inactive",
        current_period_end: null,
        plan: "free",
        pro_source: "free",
        stripe_customer_id: customerId,
        stripe_subscription_id: null,
      };
    default:
      return {
        access_source: isStripeProStatus(subscription.status) ? "stripe" : "free",
        billing_status: mapSubscriptionToProfileBillingStatus(subscription.status),
        current_period_end: isStripeProStatus(subscription.status)
          ? getSubscriptionPeriodEnd(subscription)
          : null,
        plan: isStripeProStatus(subscription.status) ? "pro" : "free",
        pro_source: isStripeProStatus(subscription.status) ? "stripe" : "free",
        stripe_customer_id: customerId,
        stripe_subscription_id: isStripeProStatus(subscription.status) ? subscription.id : null,
      };
  }
}

async function updateProfileBy(
  column: "id" | "stripe_customer_id",
  value: string,
  update: ProfileBillingUpdate,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update(update)
    .eq(column, value)
    .select("id, plan, pro_source, billing_status, access_source, stripe_subscription_id, current_period_end")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`Profile not found for ${column}.`);
  }

  console.log("[billing] profile after update:", data);
  return data.id;
}

export async function attachStripeCustomerToUser(userId: string, customerId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert({
      id: userId,
      stripe_customer_id: customerId,
    }, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function syncSubscriptionToProfile(
  subscription: Stripe.Subscription,
  fallbackCustomerId?: string | null,
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? fallbackCustomerId ?? null;

  if (!customerId) {
    throw new Error("Stripe subscription customer id is missing.");
  }

  const update = mapSubscriptionToProfileUpdate(subscription, customerId);

  if (!update) {
    console.log("[billing] skipped profile sync for subscription status:", subscription.status);
    return null;
  }

  return await updateProfileBy(
    "stripe_customer_id",
    customerId,
    update,
  );
}

export async function markProfileBillingInactiveByCustomerId(customerId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({
      access_source: "free",
      billing_status: "inactive",
      current_period_end: null,
      plan: "free",
      pro_source: "free",
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", customerId)
    .eq("access_source", "stripe")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function findProfileByUserId(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, stripe_customer_id, access_source, billing_status, plan, pro_source")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
