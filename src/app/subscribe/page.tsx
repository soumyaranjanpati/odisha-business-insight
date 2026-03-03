import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/article/NewsletterForm";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Subscribe",
  description: `Email newsletter for ${SITE_NAME} – monthly business insight report from Odisha.`,
};

export default function SubscribePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">
        Get Odisha Business Insights in Your Inbox
      </h1>
      <p className="mt-3 text-base text-gray-600">
        Subscribe to receive our monthly Odisha Business Insight PDF report with key business,
        economy, and policy updates from across the state.
      </p>

      <div className="mt-8 max-w-xl">
        <NewsletterForm />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        This is a simple, free email subscription. We don&apos;t require payment details right now.
      </p>

      <p className="mt-10 text-center text-sm text-gray-500">
        <Link href="/" className="text-primary-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

