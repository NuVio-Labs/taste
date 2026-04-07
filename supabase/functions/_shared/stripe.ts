import Stripe from "https://esm.sh/stripe@18.3.0?target=deno";

export type BillingStatus =
  | "inactive"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid";

export function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getStripeClient() {
  return new Stripe(readRequiredEnv("STRIPE_SECRET_KEY"), {
    appInfo: {
      name: "NuVio Taste",
    },
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function getAppUrl() {
  return readRequiredEnv("APP_URL").replace(/\/+$/, "");
}

export function getStripePriceId() {
  return readRequiredEnv("STRIPE_PRICE_PRO_MONTHLY");
}

export function getStripeWebhookSecret() {
  return readRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function mapStripeStatusToBillingStatus(
  status: Stripe.Subscription.Status | null | undefined,
): BillingStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    default:
      return "inactive";
  }
}

export function mapStripeStatusToPlan(
  status: Stripe.Subscription.Status | null | undefined,
): "free" | "pro" {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "unpaid":
      return "pro";
    default:
      return "free";
  }
}

export function toIsoFromUnix(value: number | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}
