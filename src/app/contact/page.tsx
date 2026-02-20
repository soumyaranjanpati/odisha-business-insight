import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Odisha Business Insight – feedback, enquiries and partnerships.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="headline text-3xl font-bold text-ink">Contact Us</h1>
      <p className="mt-2 text-gray-600">
        Have a question, tip or partnership idea? Send us a message and we&apos;ll get back to you.
      </p>

      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
