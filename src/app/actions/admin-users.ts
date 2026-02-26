"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function updateUserRole(profileId: string, roleId: string) {
  const { allowed } = await requireAdmin();
  if (!allowed) return { ok: false, message: "Unauthorized" };

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function setUserActive(profileId: string, isActive: boolean) {
  const { allowed } = await requireAdmin();
  if (!allowed) return { ok: false, message: "Unauthorized" };

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteUser(userId: string) {
  const { allowed } = await requireAdmin();
  if (!allowed) return { ok: false, message: "Unauthorized" };

  const supabase = createServiceRoleClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
