import type { Metadata } from "next";
import Link from "next/link";
import { getSubscriptionPlans } from "@/lib/subscription";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Subscribe",
  description: `Subscription plans for ${SITE_NAME} – free and premium access.`,
};

export default async function SubscribePage() {
  const plans = await getSubscriptionPlans();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">Subscribe</h1>
      <p className="mt-2 text-gray-600">
        Choose a plan. Premium unlocks full access to premium articles and analysis.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border-2 p-6 ${
              plan.grants_premium_access
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
            {plan.description && (
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
            )}
            <p className="mt-4">
              <span className="text-2xl font-bold text-ink">
                {plan.amount_cents === 0
                  ? "Free"
                  : `₹${(plan.amount_cents / 100).toLocaleString()}`}
              </span>
              {plan.amount_cents > 0 && (
                <span className="text-sm text-gray-500">/{plan.interval}</span>
              )}
            </p>
            {plan.grants_premium_access && (
              <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Premium access
              </span>
            )}
            <p className="mt-4 text-sm text-gray-500">
              Payment integration (e.g. Stripe) can be added. Plans are stored in{" "}
              <code className="rounded bg-gray-100 px-1">subscription_plans</code>.
            </p>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          <p>No plans configured yet. Run migration 003 and seed subscription_plans.</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Back to home
          </Link>
        </div>
      )}

      <p className="mt-10 text-center text-sm text-gray-500">
        <Link href="/" className="text-primary-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
