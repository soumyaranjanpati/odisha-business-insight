import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/article/NewsletterForm";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Subscribe",
  description: `Subscribe to ${SITE_NAME} – receive daily morning updates via WhatsApp or monthly reports by email.`,
};

export default function SubscribePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">
        Stay Updated with {SITE_NAME}
      </h1>
      <p className="mt-3 text-base text-gray-600">
        Subscribe to receive business news and policy updates from Odisha. Choose how you want
        to stay informed — via email, WhatsApp, or both.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">💬</span>
            <h2 className="font-semibold text-green-800">WhatsApp Updates</h2>
          </div>
          <p className="mt-1 text-sm text-green-700">
            Get a daily morning digest of the top Odisha business stories delivered straight
            to your WhatsApp.
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">✉️</span>
            <h2 className="font-semibold text-blue-800">Email Newsletter</h2>
          </div>
          <p className="mt-1 text-sm text-blue-700">
            Receive our monthly {SITE_NAME} PDF report with in-depth analysis
            and key economic updates.
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-xl">
        <NewsletterForm />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Free subscription. No payment required. You can unsubscribe at any time.
      </p>

      <p className="mt-10 text-center text-sm text-gray-500">
        <Link href="/" className="text-primary-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

