/**
 * Subscription helpers: check premium access, list plans.
 * Ready for Stripe integration (use plan.stripe_price_id, user_subscriptions.stripe_*).
 */

import { createClient } from "@/lib/supabase/server";

/** Whether the current user has an active subscription that grants premium access. */
export async function hasActivePremiumSubscription(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_subscriptions")
    .select("id, plan:subscription_plans(grants_premium_access)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .maybeSingle();

  if (!data) return false;
  const plan = Array.isArray(data.plan) ? data.plan[0] : data.plan;
  return !!(plan as { grants_premium_access?: boolean } | null)?.grants_premium_access;
}

/** Fetch active subscription plans for pricing page or checkout. */
export async function getSubscriptionPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as import("@/types").SubscriptionPlan[];
}
