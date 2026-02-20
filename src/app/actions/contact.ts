"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function submitContactMessage(formData: FormData): Promise<{
  success: boolean;
  message?: string;
}> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = (formData.get("subject") as string) || null;
  const message = formData.get("message") as string;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return { success: false, message: "Name, email and message are required." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || null,
    message: message.trim(),
  });

  if (error) {
    console.error("Contact form error:", error);
    return { success: false, message: "Failed to send message. Please try again." };
  }
  return { success: true, message: "Thank you. We will get back to you soon." };
}
