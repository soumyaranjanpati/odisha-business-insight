"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Server action: add email to newsletter_subscribers.
 * Uses service role to bypass RLS (table has no public insert policy).
 */
export async function subscribeNewsletter(email: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { success: false, message: "Please enter a valid email." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email: trimmed,
      is_active: true,
      unsubscribed_at: null,
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Newsletter subscribe error:", error);
    return { success: false, message: "Subscription failed. Please try again later." };
  }
  return { success: true, message: "You have been subscribed successfully." };
}
