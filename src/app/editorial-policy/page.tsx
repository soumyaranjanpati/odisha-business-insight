import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "Odisha Economy editorial policy covering accuracy, independence, transparency and corrections.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">Editorial Policy</h1>
      <p className="mt-4 text-lg text-gray-600">
        Odisha Economy follows responsible journalism practices to ensure accuracy,
        transparency and independence in reporting.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Accuracy and Verification</h2>
        <p className="mt-2 text-gray-600">
          Our editorial team verifies information through credible sources including government
          announcements, official statements and industry reports. We strive to confirm facts
          before publication and update stories as new information becomes available.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Editorial Independence</h2>
        <p className="mt-2 text-gray-600">
          Editorial decisions are made independently and are not influenced by advertisers,
          sponsors or external stakeholders. Our reporting reflects journalistic judgment, not
          commercial interest.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Transparency</h2>
        <p className="mt-2 text-gray-600">
          Any sponsored or promotional content will be clearly labeled so readers can distinguish
          between editorial and commercial content at all times.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Corrections</h2>
        <p className="mt-2 text-gray-600">
          If any factual error is identified in an article, we will correct it promptly and note
          the correction on the relevant article where appropriate. Readers can report errors via
          our{" "}
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contact
          </Link>{" "}
          page or refer to our{" "}
          <Link href="/corrections-policy" className="text-primary-600 hover:underline">
            Corrections Policy
          </Link>
          .
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        For editorial enquiries, please{" "}
        <Link href="/contact" className="text-primary-600 hover:underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
