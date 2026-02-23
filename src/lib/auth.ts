import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
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
 * Uses service role to read profile when key is set (so we see the latest role);
 * otherwise falls back to anon client.
 */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let profile: {
    id: string;
    role_id: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
    mobile_number: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  } | null = null;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createServiceRoleClient();
    const res = await admin
      .from("user_profiles")
      .select("id, role_id, display_name, avatar_url, email, mobile_number, is_active, created_at, updated_at")
      .eq("id", user.id)
      .single();
    if (!res.error && res.data) profile = res.data;
  }

  if (!profile) {
    const { data } = await supabase
      .from("user_profiles")
      .select("id, role_id, display_name, avatar_url, email, mobile_number, is_active, created_at, updated_at")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  if (!profile) return null;
  if (profile.is_active === false) return null;

  const roleClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceRoleClient() : supabase;
  const { data: roleRow } = await roleClient
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .single();

  const roleName = roleRow?.name ?? "public";
  const normalizedRole =
    roleName === "subscriber" ? "public" : (roleName as UserRole);

  return {
    ...profile,
    roleName: normalizedRole,
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
