import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Odisha Business Insight – how we collect, use and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-4 text-gray-500 text-sm">Last updated: {new Date().getFullYear()}</p>
      <p className="mt-4 text-lg text-gray-600">
        Odisha Business Insight is committed to protecting your privacy. This policy explains what
        information we collect, how we use it and how we protect it.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Information We Collect</h2>
        <p className="mt-2 text-gray-600">
          We may collect personal information such as email addresses and names when users:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
          <li>Subscribe to our newsletter</li>
          <li>Contact us via the contact form</li>
          <li>Register for an account on the site</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">How We Use Information</h2>
        <p className="mt-2 text-gray-600">
          Information collected is used to:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
          <li>Send newsletters and monthly reports to subscribers</li>
          <li>Respond to enquiries submitted via the contact form</li>
          <li>Improve site functionality and user experience</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Cookies and Analytics</h2>
        <p className="mt-2 text-gray-600">
          We may use cookies and analytics tools (such as Google Analytics) to understand website
          traffic patterns and improve user experience. These tools may collect anonymised usage
          data such as pages visited and time spent on site. You can control cookie preferences
          through your browser settings.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Data Protection</h2>
        <p className="mt-2 text-gray-600">
          We do not sell or share personal information with third parties without your consent.
          Data is stored securely and access is limited to authorised personnel only. We take
          reasonable steps to protect information from unauthorised access, loss or misuse.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Your Rights</h2>
        <p className="mt-2 text-gray-600">
          You may request access to, correction of, or deletion of your personal data at any time
          by contacting us. To unsubscribe from our newsletter, use the unsubscribe link in any
          email or contact us directly.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        Questions about this policy? Please{" "}
        <Link href="/contact" className="text-primary-600 hover:underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
