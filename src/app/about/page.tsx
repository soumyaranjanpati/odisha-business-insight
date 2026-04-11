import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Odisha Economy — independent digital publication on economic, business, and policy developments in and around Odisha.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">About Odisha Economy</h1>

      <p className="mt-4 text-lg text-gray-600">
        Odisha Economy is an independent digital publication dedicated to covering economic,
        business, and policy developments in and around Odisha.
      </p>

      <p className="mt-4 text-gray-600">
        Our core objective is to track, analyse, and explain the forces shaping Odisha&apos;s
        economic growth — from large-scale industrial investments and infrastructure projects to
        startups, MSMEs, and policy decisions. We aim to provide clarity beyond headlines by
        connecting developments with their real impact on businesses, employment, and the broader
        economy.
      </p>

      <p className="mt-4 text-gray-600">
        At a time when Odisha is undergoing rapid industrial and economic transformation, there is
        a growing need for focused, reliable, and context-driven reporting. Odisha Economy was
        created to bridge this gap by offering structured, insight-driven coverage tailored
        specifically to the state.
      </p>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">What We Focus On</h2>
        <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600">
          <li>Industrial growth and investments</li>
          <li>Government policy and economic decisions</li>
          <li>Infrastructure and large-scale projects</li>
          <li>Startups, innovation, and entrepreneurship</li>
          <li>MSMEs and rural economy</li>
          <li>Energy, mining, and manufacturing sectors</li>
        </ul>
      </section>

      <p className="mt-10 text-gray-600">
        Our editorial approach combines factual reporting with contextual analysis — helping readers
        understand not just what is happening, but why it matters for Odisha&apos;s long-term
        economic trajectory.
      </p>

      <p className="mt-4 text-gray-600">
        Odisha Economy was founded by Ranjan and Priyanshu with the vision of building a credible
        and consistent source of economic intelligence for the state.
      </p>

      <p className="mt-4 text-gray-600">
        We are committed to accuracy, transparency, and responsible journalism, and continuously
        strive to improve the depth and quality of our coverage.
      </p>

      <p className="mt-6 text-sm text-gray-500">
        For inquiries, feedback, or collaborations, contact us at:{" "}
        <a href="mailto:connect@zylva.tech" className="text-primary-600 hover:underline">
          connect@zylva.tech
        </a>
      </p>
    </div>
  );
}
