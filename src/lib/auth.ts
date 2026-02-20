import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/**
 * Get current auth user (server only).
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get current user's profile including role name (server only).
 */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*, role:roles(name)")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;
  return {
    ...profile,
    roleName: (profile.role as { name: string } | null)?.name ?? "public",
  };
}

/**
 * Get current user's role name.
 */
export async function getRole(): Promise<UserRole | null> {
  const profile = await getProfile();
  return (profile?.roleName as UserRole) ?? null;
}

/**
 * Require editor or admin role. Redirect or throw if not allowed.
 */
export async function requireEditor() {
  const role = await getRole();
  if (role !== "editor" && role !== "admin") {
    return { allowed: false, role };
  }
  return { allowed: true, role };
}

/**
 * Require admin role.
 */
export async function requireAdmin() {
  const role = await getRole();
  if (role !== "admin") {
    return { allowed: false, role };
  }
  return { allowed: true, role };
}
