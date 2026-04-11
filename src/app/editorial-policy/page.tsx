import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "Odisha Economy editorial policy: accuracy, verification, independence, news vs opinion, corrections, and scope.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">
        Editorial Policy – Odisha Economy
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Odisha Economy is committed to providing accurate, reliable, and insight-driven coverage of
        economic, business, and policy developments related to Odisha.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Accuracy and Verification</h2>
        <p className="mt-2 text-gray-600">
          We prioritize factual accuracy and rely on credible and verifiable sources, including
          official government releases, company announcements, public data, and reputable
          publications. Every effort is made to ensure that the information we publish is correct at
          the time of publication.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Context and Analysis</h2>
        <p className="mt-2 text-gray-600">
          Beyond reporting events, we aim to provide context and interpretation to help readers
          understand the economic and business implications of developments in Odisha.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Use of Sources</h2>
        <p className="mt-2 text-gray-600">
          Some of our articles are based on publicly available information from official or
          third-party sources. In such cases, we aim to add value through structured presentation,
          summarization, and Odisha-focused insights.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Editorial Independence</h2>
        <p className="mt-2 text-gray-600">
          Our editorial decisions are independent and are not influenced by advertisers, sponsors, or
          external entities. Sponsored content, if any, will be clearly identified.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">News vs Opinion</h2>
        <p className="mt-2 text-gray-600">
          We distinguish between factual reporting and opinion-based content. Opinion or analysis
          pieces reflect interpretation and perspective based on available information and are
          presented transparently.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Corrections and Updates</h2>
        <p className="mt-2 text-gray-600">
          If any factual error is identified, we are committed to correcting it promptly. Updates
          or corrections will be made transparently to maintain the integrity of our content.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Scope of Coverage</h2>
        <p className="mt-2 text-gray-600">
          Our primary focus is on Odisha&apos;s economy, including industry, infrastructure,
          startups, policy, and related sectors that influence economic growth in the state.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        We welcome feedback, corrections, and suggestions from our readers. Please reach out to
        us at:{" "}
        <a href="mailto:connect@zylva.tech" className="text-primary-600 hover:underline">
          connect@zylva.tech
        </a>
      </p>
    </div>
  );
}
