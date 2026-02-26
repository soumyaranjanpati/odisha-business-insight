"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateUserRole, setUserActive, deleteUser } from "@/app/actions/admin-users";
import { Toast } from "@/components/ui/Toast";

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  mobile_number: string | null;
  role_id: string;
  role: { name: string } | { name: string }[] | null;
  is_active?: boolean;
  created_at: string;
};

type RoleOption = { id: string; name: string };

export function ManageEditorsClient({
  profiles,
  roles,
  currentUserId,
}: {
  profiles: ProfileRow[];
  roles: RoleOption[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function getRoleName(r: ProfileRow) {
    const role = Array.isArray(r.role) ? r.role[0] : r.role;
    return (role as { name: string } | null)?.name ?? "—";
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function onRoleChange(profileId: string, roleId: string) {
    const res = await updateUserRole(profileId, roleId);
    if (res.ok) {
      setToast({ message: "Role updated", type: "success" });
      startTransition(() => router.refresh());
    } else {
      setToast({ message: res.message ?? "Failed to update role", type: "error" });
    }
  }

  async function onToggleActive(profileId: string, currentlyActive: boolean) {
    const res = await setUserActive(profileId, !currentlyActive);
    if (res.ok) {
      setToast({ message: currentlyActive ? "User deactivated" : "User activated", type: "success" });
      startTransition(() => router.refresh());
    } else {
      setToast({ message: res.message ?? "Failed to update status", type: "error" });
    }
  }

  async function onDelete(profileId: string) {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    const res = await deleteUser(profileId);
    if (res.ok) {
      setToast({ message: "User deleted", type: "success" });
      startTransition(() => router.refresh());
    } else {
      setToast({ message: res.message ?? "Failed to delete", type: "error" });
    }
  }

  const appRoles = roles;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="px-4 py-3 font-medium text-ink">Name</th>
          <th className="px-4 py-3 font-medium text-ink">Email</th>
          <th className="px-4 py-3 font-medium text-ink">Mobile</th>
          <th className="px-4 py-3 font-medium text-ink">Role</th>
          <th className="px-4 py-3 font-medium text-ink">Created</th>
          <th className="px-4 py-3 font-medium text-ink">Status</th>
          <th className="px-4 py-3 font-medium text-ink">Actions</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((u) => {
          const active = u.is_active !== false;
          const isSelf = u.id === currentUserId;
          return (
            <tr
              key={u.id}
              className={`border-b border-gray-100 ${!active ? "bg-gray-50 text-gray-500" : ""}`}
            >
              <td className="px-4 py-3 font-medium text-ink">{u.display_name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{u.email ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{u.mobile_number ?? "—"}</td>
              <td className="px-4 py-3">
                {isSelf ? (
                  <span>{getRoleName(u)}</span>
                ) : (
                  <select
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-ink"
                    value={appRoles.find((r) => r.id === u.role_id)?.id ?? u.role_id}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                    disabled={pending}
                  >
                    {appRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{formatDate(u.created_at)}</td>
              <td className="px-4 py-3">
                {active ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-amber-600">Inactive</span>
                )}
              </td>
              <td className="px-4 py-3">
                {!isSelf && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleActive(u.id, active)}
                      disabled={pending}
                      className="text-sm text-primary-600 hover:underline disabled:opacity-50"
                    >
                      {active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(u.id)}
                      disabled={pending}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
      </div>
    </>
  );
}
