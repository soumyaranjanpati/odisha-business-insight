import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description:
    "Corrections Policy for Odisha Business Insight – how we handle and publish factual corrections.",
};

export default function CorrectionsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">Corrections Policy</h1>
      <p className="mt-4 text-lg text-gray-600">
        Odisha Business Insight is committed to accurate and fair reporting. When errors occur,
        we take responsibility and act quickly to set the record straight.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Our Commitment</h2>
        <p className="mt-2 text-gray-600">
          If any factual error is identified in a published article, our editorial team will
          review the information promptly and make the necessary corrections. We believe
          transparency in acknowledging mistakes is essential to maintaining reader trust.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">How Corrections Are Made</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
          <li>Minor factual corrections are made silently if the error is negligible.</li>
          <li>
            Significant factual errors are corrected and noted clearly within the article
            with a correction notice indicating what was changed and when.
          </li>
          <li>
            In cases where a correction substantially changes the meaning of a published
            article, a correction note will appear prominently at the top of the article.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Reporting an Error</h2>
        <p className="mt-2 text-gray-600">
          Readers can report corrections by contacting the editorial team via the{" "}
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contact
          </Link>{" "}
          page. Please include the article title or URL and a description of the error to help
          us investigate quickly.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Editorial Independence in Corrections</h2>
        <p className="mt-2 text-gray-600">
          All correction decisions are made by the editorial team independently. We do not remove
          accurately reported content due to external pressure from individuals, organisations or
          advertisers.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        To report an error, please{" "}
        <Link href="/contact" className="text-primary-600 hover:underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
