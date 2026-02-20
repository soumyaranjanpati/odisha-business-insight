"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitContactMessage } from "@/app/actions/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus("loading");
    setMessage("");
    const result = await submitContactMessage(formData);
    setStatus(result.success ? "success" : "error");
    setMessage(result.message ?? "");
    if (result.success) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" name="name" required placeholder="Your name" />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
      />
      <Input label="Subject" name="subject" placeholder="Subject (optional)" />
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-ink shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Your message..."
        />
      </div>
      <Button type="submit" isLoading={status === "loading"} disabled={status === "success"}>
        {status === "success" ? "Sent" : "Send message"}
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
