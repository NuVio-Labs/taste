export type Plan = "free" | "pro";

/**
 * All features that can be access-controlled by plan.
 * Add new gated features here — nowhere else.
 */
export type Feature = "favorites" | "shopping_list" | "pro_dashboard" | "cooking_mode";

const PRO_ONLY_FEATURES: ReadonlySet<Feature> = new Set([
  "favorites",
  "shopping_list",
  "pro_dashboard",
  "cooking_mode",
]);

/**
 * Central entitlement check.
 * Use this everywhere instead of inline `plan === "pro"` comparisons.
 *
 * TODO (payment): When Stripe/payment is integrated, replace the plan source
 * with the verified subscription status from your backend rather than the
 * profiles.plan field. The call sites of canAccess() do not need to change.
 */
export function canAccess(plan: Plan, feature: Feature): boolean {
  if (plan === "pro") return true;
  return !PRO_ONLY_FEATURES.has(feature);
}

/** Human-readable label for a plan, used in badges and copy. */
export function planLabel(plan: Plan): string {
  return plan === "pro" ? "Pro" : "Free";
}
