"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

const FIX_USERS: { email: string; role: "editor" | "admin" }[] = [
  { email: "editerodishabusinessnews@gmail.com", role: "editor" },
  { email: "adminodishabusinessnews@gmail.com", role: "admin" },
];

/**
 * One-time fix: ensure the current user's profile has the correct role.
 * Uses service role so it works even if RLS or trigger didn't set the role.
 * Call from Profile page when user sees Role: public but should be editor/admin.
 */
export async function fixMyRole(userId: string, userEmail: string | undefined): Promise<{ ok: boolean; message: string }> {
  if (!userEmail?.trim()) return { ok: false, message: "No email" };

  const email = userEmail.trim().toLowerCase();
  const match = FIX_USERS.find((u) => u.email.toLowerCase() === email);
  if (!match) return { ok: false, message: "Your email is not in the fix list. Use SQL script instead." };

  const supabase = createServiceRoleClient();

  const { data: roleRow } = await supabase
    .from("roles")
    .select("id")
    .eq("name", match.role)
    .single();

  if (!roleRow) return { ok: false, message: `Role '${match.role}' not found in database.` };

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id, role_id")
    .eq("id", userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role_id: roleRow.id, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Role set to ${match.role}. Refresh the page.` };
  }

  const { error } = await supabase.from("user_profiles").insert({
    id: userId,
    role_id: roleRow.id,
    display_name: email.split("@")[0],
    email: userEmail,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `Profile created with role ${match.role}. Refresh the page.` };
}
