import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Odisha Economy — independent digital publication on business, economy, policy, and industry in Odisha.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">About Odisha Economy</h1>

      <p className="mt-4 text-lg text-gray-600">
        Odisha Economy is an independent digital publication focused on business, economy,
        policy, and industry developments in Odisha.
      </p>

      <p className="mt-4 text-gray-600">
        Our mission is to become the most trusted source of insights on Odisha&apos;s economic
        growth — covering investments, infrastructure, startups, government policies, and emerging
        sectors shaping the state&apos;s future.
      </p>

      <p className="mt-4 text-gray-600">
        We go beyond headlines to explain what developments mean for businesses, entrepreneurs,
        and citizens. Our coverage includes on-ground impact, policy analysis, and
        sector-specific insights to help readers understand the bigger picture.
      </p>

      <p className="mt-4 text-gray-600">
        Odisha Economy was founded by Ranjan and Priyanshu, with the vision of building a
        credible and focused business intelligence platform for the state.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">What We Cover</h2>
        <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600">
          <li>Industry & Infrastructure</li>
          <li>Government Policy & Investments</li>
          <li>Startups & Innovation</li>
          <li>MSMEs & Rural Economy</li>
          <li>Energy, Mining & Manufacturing</li>
        </ul>
      </section>

      <p className="mt-10 text-gray-600">
        We are committed to accuracy, transparency, and responsible journalism, with a clear
        focus on Odisha&apos;s long-term economic transformation.
      </p>

      <p className="mt-6 text-sm text-gray-500">
        For inquiries, collaborations, or feedback, contact us at:{" "}
        <a
          href="mailto:connect@zylva.tech"
          className="text-primary-600 hover:underline"
        >
          connect@zylva.tech
        </a>
      </p>
    </div>
  );
}
