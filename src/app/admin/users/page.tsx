import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/Card";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, role:roles(name)")
    .order("display_name", { ascending: true });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load users.
      </div>
    );
  }

  const list = profiles ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Users & Roles</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-ink">User ID</th>
                <th className="px-4 py-3 font-medium text-ink">Display name</th>
                <th className="px-4 py-3 font-medium text-ink">Role</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u: { id: string; display_name: string | null; role: { name: string } | { name: string }[] | null }) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{u.id}</td>
                  <td className="px-4 py-3">{u.display_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {Array.isArray(u.role) ? u.role[0]?.name : (u.role as { name: string } | null)?.name ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-gray-500">
        User roles are managed via Supabase (user_profiles.role_id). Assign roles in database or add UI here.
      </p>
    </div>
  );
}
