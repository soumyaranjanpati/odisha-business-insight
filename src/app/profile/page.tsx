import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { FixRoleButton } from "./FixRoleButton";
import { ProfileEditForm } from "./ProfileEditForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/auth/login?redirect=/profile");

  const profile = await getProfile();
  const role = profile?.roleName ?? "public";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="headline mb-6 text-2xl font-bold text-ink">Profile</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-ink">Account</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-ink">
              Edit your name, email, and mobile number
            </h3>
            <ProfileEditForm
              initialDisplayName={profile?.display_name ?? null}
              initialEmail={profile?.email ?? user.email ?? null}
              initialMobile={profile?.mobile_number ?? null}
            />
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-ink">Role:</span> {role}
            </p>
            {role === "public" && (
              <FixRoleButton userId={user.id} userEmail={user.email ?? undefined} />
            )}
          </div>
          {(role === "editor" || role === "admin") && (
            <p className="pt-2">
              <Link
                href="/editor"
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Go to My Posts →
              </Link>
            </p>
          )}
          {role === "admin" && (
            <p>
              <Link
                href="/admin"
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Go to Admin Panel →
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
