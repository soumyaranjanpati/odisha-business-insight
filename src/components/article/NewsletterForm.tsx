"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() && !whatsapp.trim()) {
      setStatus("error");
      setMessage("Please enter your email address or WhatsApp number.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const result = await subscribeNewsletter({
      email: email.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
    });

    if (result.success) {
      setStatus("success");
      setEmail("");
      setWhatsapp("");
      setMessage(result.message ?? "Thank you for subscribing!");
    } else {
      setStatus("error");
      setMessage(result.message ?? "Something went wrong. Please try again.");
    }
  }

  const isDisabled = status === "loading" || status === "success";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isDisabled}
          className="min-w-0 flex-1"
          aria-label="Email address for newsletter"
        />
        <Input
          type="tel"
          placeholder="WhatsApp number (+91...)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          disabled={isDisabled}
          className="min-w-0 flex-1"
          aria-label="WhatsApp number for newsletter"
        />
      </div>
      <p className="text-xs text-gray-500">
        Enter your email, WhatsApp number, or both. At least one is required.
      </p>
      <Button
        type="submit"
        size="md"
        isLoading={status === "loading"}
        disabled={isDisabled}
        className="w-full sm:w-auto"
      >
        {status === "success" ? "Subscribed!" : "Subscribe"}
      </Button>
      {message && (
        <p
          className={`text-sm ${
            status === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
