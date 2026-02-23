import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { ManageEditorsClient } from "./ManageEditorsClient";

export default async function AdminUsersPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, display_name, email, mobile_number, role_id, role:roles(name), is_active, created_at")
      .order("display_name", { ascending: true, nullsFirst: false }),
    supabase.from("roles").select("id, name").order("name"),
  ]);

  if (profilesError || rolesError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load users.
      </div>
    );
  }

  const list = (profiles ?? []) as {
    id: string;
    display_name: string | null;
    email: string | null;
    mobile_number: string | null;
    role_id: string;
    role: { name: string } | { name: string }[] | null;
    is_active?: boolean;
    created_at: string;
  }[];
  const rolesList = (roles ?? []) as { id: string; name: string }[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Users</h1>
      <p className="mb-4 text-sm text-gray-600">
        Change roles (public, editor, admin), deactivate, or delete users. Changes save instantly.
      </p>
      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="font-medium">No users yet</p>
              <p className="mt-1 text-sm">User profiles appear here after signup.</p>
            </div>
          ) : (
            <ManageEditorsClient
              profiles={list}
              roles={rolesList}
              currentUserId={profile.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
