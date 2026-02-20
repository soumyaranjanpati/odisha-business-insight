import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Odisha Business Insight – mission, editorial values and focus on Odisha's economy and business landscape.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">About Us</h1>
      <p className="mt-4 text-lg text-gray-600">
        Odisha Business Insight is your trusted source for business news, economic updates and
        policy coverage from Odisha. We focus on clarity, accuracy and relevance for entrepreneurs,
        policymakers and anyone interested in the state&apos;s economic growth.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Our Mission</h2>
        <p className="mt-2 text-gray-600">
          To provide timely, well-sourced business and economic news that helps readers understand
          Odisha&apos;s economy, MSME sector, startups, infrastructure and policy environment. We
          aim to support informed decision-making and foster a more connected business community.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Editorial Values</h2>
        <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600">
          <li>Accuracy and fact-checking before publication</li>
          <li>Independence and transparency in reporting</li>
          <li>Relevance to Odisha&apos;s business and economy</li>
          <li>Respect for diverse viewpoints and ethical standards</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Odisha Economic Focus</h2>
        <p className="mt-2 text-gray-600">
          We cover economy-wide trends, MSME and startup ecosystems, industrial and infrastructure
          developments, and state and central policy that affects business in Odisha. From markets
          and investments to sector-specific updates, our goal is to keep you informed with
          context and depth.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        For partnerships or editorial enquiries, please{" "}
        <a href="/contact" className="text-primary-600 hover:underline">
          contact us
        </a>
        .
      </p>
    </div>
  );
}
