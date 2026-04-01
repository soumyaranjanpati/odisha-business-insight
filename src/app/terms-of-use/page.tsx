import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of Use for Odisha Business Insight – copyright, content usage and limitation of liability.",
};

export default function TermsOfUsePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">Terms of Use</h1>
      <p className="mt-4 text-gray-500 text-sm">Last updated: {new Date().getFullYear()}</p>
      <p className="mt-4 text-lg text-gray-600">
        All content published on Odisha Business Insight is for informational purposes only. By
        accessing or using this site, you agree to the following terms.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Copyright</h2>
        <p className="mt-2 text-gray-600">
          All articles, graphics, logos and materials published on this site are the intellectual
          property of Odisha Business Insight unless otherwise stated. Unauthorised reproduction,
          redistribution or commercial use of any content without prior written permission is
          prohibited.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Content Usage</h2>
        <p className="mt-2 text-gray-600">
          Users may quote or reference our content for non-commercial purposes with proper
          attribution and a visible link back to the original article. Any reproduction beyond
          brief quotation requires written consent from our editorial team.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Accuracy of Information</h2>
        <p className="mt-2 text-gray-600">
          While we strive for accuracy, content on this site is provided "as is" without warranty
          of any kind. We recommend readers verify information independently before making
          business or financial decisions.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Limitation of Liability</h2>
        <p className="mt-2 text-gray-600">
          Odisha Business Insight is not responsible for any direct or indirect losses resulting
          from reliance on published information. We are not liable for errors, omissions or
          interruptions in content or service availability.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Changes to Terms</h2>
        <p className="mt-2 text-gray-600">
          We may update these terms at any time. Continued use of the site after changes are
          posted constitutes acceptance of the revised terms.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        For questions, please{" "}
        <Link href="/contact" className="text-primary-600 hover:underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
