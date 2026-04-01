"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export type SubscribePayload = {
  email?: string;
  whatsapp?: string;
};

/**
 * Server action: subscribe to newsletter via email and/or WhatsApp number.
 * At least one contact method must be provided.
 * Uses service role to bypass RLS.
 */
export async function subscribeNewsletter(payload: SubscribePayload): Promise<{
  success: boolean;
  message?: string;
}> {
  const email = payload.email?.trim().toLowerCase() || null;
  const whatsapp = payload.whatsapp?.replace(/\s+/g, "").replace(/[^\d+]/g, "") || null;

  if (!email && !whatsapp) {
    return { success: false, message: "Please provide an email address or WhatsApp number." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  if (whatsapp && whatsapp.replace(/^\+/, "").length < 10) {
    return { success: false, message: "Please enter a valid WhatsApp number (min 10 digits)." };
  }

  const supabase = createServiceRoleClient();

  // --- Email path: upsert using email as conflict key ---
  if (email) {
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email,
        whatsapp_number: whatsapp,
        is_active: true,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("Newsletter subscribe error (email path):", error);
      return { success: false, message: "Subscription failed. Please try again later." };
    }
    return { success: true, message: "You have been subscribed successfully!" };
  }

  // --- WhatsApp-only path: check existence then insert/update ---
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, is_active")
    .eq("whatsapp_number", whatsapp!)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) {
      return { success: true, message: "This WhatsApp number is already subscribed!" };
    }
    // Re-activate
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: true, unsubscribed_at: null })
      .eq("id", existing.id);

    if (error) {
      console.error("Newsletter re-activate error:", error);
      return { success: false, message: "Subscription failed. Please try again later." };
    }
    return { success: true, message: "You have been re-subscribed successfully!" };
  }

  // New WhatsApp-only subscriber
  const { error } = await supabase.from("newsletter_subscribers").insert({
    whatsapp_number: whatsapp,
    email: null,
    is_active: true,
  });

  if (error) {
    console.error("Newsletter subscribe error (whatsapp path):", error);
    return { success: false, message: "Subscription failed. Please try again later." };
  }
  return { success: true, message: "You have been subscribed successfully!" };
}
