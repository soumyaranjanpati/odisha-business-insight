"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    const result = await subscribeNewsletter(email.trim());
    if (result.success) {
      setStatus("success");
      setEmail("");
      setMessage(result.message ?? "Thank you for subscribing!");
    } else {
      setStatus("error");
      setMessage(result.message ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "success"}
        className="min-w-0 flex-1"
        required
        aria-label="Email for newsletter"
      />
      <Button
        type="submit"
        size="md"
        isLoading={status === "loading"}
        disabled={status === "success"}
        className="shrink-0"
      >
        {status === "success" ? "Subscribed" : "Subscribe"}
      </Button>
      {message && (
        <p
          className={`w-full text-sm sm:col-span-2 ${
            status === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
