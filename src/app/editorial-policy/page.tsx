import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "Odisha Economy editorial policy: accuracy, sourcing, originality, news vs opinion, corrections, and independence.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">
        Editorial Policy – Odisha Economy
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        At Odisha Economy, we are committed to delivering accurate, reliable, and insightful
        coverage of business, economy, and policy developments in Odisha.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Accuracy and Sourcing</h2>
        <p className="mt-2 text-gray-600">
          We prioritize factual reporting and rely on credible sources such as official government
          releases, company announcements, and verified data. Wherever possible, we provide context
          and analysis to help readers understand the significance of developments.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Originality and Value Addition</h2>
        <p className="mt-2 text-gray-600">
          While we may report on publicly available information, we strive to add value through
          analysis, interpretation, and Odisha-specific insights.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">News vs Opinion</h2>
        <p className="mt-2 text-gray-600">
          We clearly distinguish between factual reporting and opinion-based content. Opinion pieces
          are intended to provide perspective and are based on available data and trends.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Corrections Policy</h2>
        <p className="mt-2 text-gray-600">
          If any factual error is identified, we are committed to correcting it promptly and
          transparently.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Editorial Independence</h2>
        <p className="mt-2 text-gray-600">
          Our editorial decisions are independent and are not influenced by advertisers, sponsors,
          or external stakeholders.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Focus Area</h2>
        <p className="mt-2 text-gray-600">
          Our coverage is dedicated to Odisha&apos;s economy, including industry, infrastructure,
          startups, and public policy.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        For any concerns, corrections, or feedback, please contact:{" "}
        <a href="mailto:connect@zylva.tech" className="text-primary-600 hover:underline">
          connect@zylva.tech
        </a>
      </p>
    </div>
  );
}
