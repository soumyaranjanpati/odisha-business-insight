"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function updateProfile(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const user = await getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  const displayName = (formData.get("display_name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: displayName || null,
      email: email || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Profile updated" };
}
