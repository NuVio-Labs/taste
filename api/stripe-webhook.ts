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

function toIso(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function customerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
) {
  return typeof customer === "string" ? customer : (customer?.id ?? null);
}

function isProStatus(status: Stripe.Subscription.Status) {
  return ["active", "trialing", "past_due", "unpaid"].includes(status);
}

function getPeriodEnd(subscription: Stripe.Subscription) {
  const s = subscription as Stripe.Subscription & { current_period_end?: number };
  if (typeof s.current_period_end === "number") return toIso(s.current_period_end);
  const item = subscription.items.data.slice().sort(
    (a, b) => (b.current_period_end ?? 0) - (a.current_period_end ?? 0),
  )[0];
  return toIso(item?.current_period_end);
}

async function attachCustomerToUser(userId: string, cid: string) {
  const admin = getAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert({ id: userId, stripe_customer_id: cid }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  fallbackCustomerId?: string | null,
) {
  const cid =
    customerId(subscription.customer) ?? fallbackCustomerId ?? null;
  if (!cid) throw new Error("Missing customer id");

  const status = subscription.status;
  const pro = isProStatus(status);

  const update = {
    access_source: pro ? "stripe" : "free",
    billing_status: (["active", "trialing"].includes(status) ? "active" : status) as string,
    cancel_at: toIso(subscription.cancel_at),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    canceled_at: toIso(subscription.canceled_at),
    current_period_end: pro ? getPeriodEnd(subscription) : null,
    plan: pro ? "pro" : "free",
    pro_source: pro ? "stripe" : "free",
    stripe_customer_id: cid,
    stripe_subscription_id: pro ? subscription.id : null,
  };

  const admin = getAdminClient();
  const { error } = await admin
    .from("profiles")
    .update(update)
    .eq("stripe_customer_id", cid);
  if (error) throw new Error(error.message);
}

async function markInactive(cid: string) {
  const admin = getAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      access_source: "free",
      billing_status: "inactive",
      cancel_at: null,
      cancel_at_period_end: false,
      canceled_at: null,
      current_period_end: null,
      plan: "free",
      pro_source: "free",
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", cid);
  if (error) throw new Error(error.message);
}

export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getEnv("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    return res.status(400).json({ error: msg });
  }

  try {
    const stripe = getStripeClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const cid = customerId(session.customer);
        const userId = session.metadata?.supabase_user_id ?? null;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription as Stripe.Subscription)?.id ?? null;

        if (userId && cid) await attachCustomerToUser(userId, cid);
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscription(sub, cid);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : (invoice.subscription as Stripe.Subscription)?.id ?? null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : (invoice.subscription as Stripe.Subscription)?.id ?? null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        } else {
          const cid = customerId(invoice.customer);
          if (cid) await markInactive(cid);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const cid = customerId(sub.customer);
        if (cid) await markInactive(cid);
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook handling failed";
    console.error("[stripe-webhook]", msg);
    return res.status(500).json({ error: msg });
  }
}
