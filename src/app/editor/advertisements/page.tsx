import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { ManageAdsClient } from "./ManageAdsClient";

export const dynamic = "force-dynamic";

export default async function ManageAdvertisementsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login?redirect=/editor/advertisements");
  if (profile.roleName !== "editor" && profile.roleName !== "admin") redirect("/");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("advertisements")
    .select("id, image_url, description, advertiser, amount_per_month, total_amount, start_date, end_date, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load advertisements.
      </div>
    );
  }

  const ads = (data ?? []).map((a) => ({
    ...a,
    amount_per_month: a.amount_per_month != null ? Number(a.amount_per_month) : null,
    total_amount: a.total_amount != null ? Number(a.total_amount) : null,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Manage Advz</h1>
        <Link href="/editor/advertisements/new">
          <span className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Add Advertisement
          </span>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <ManageAdsClient ads={ads} isAdmin={profile.roleName === "admin"} />
        </CardContent>
      </Card>
    </div>
  );
}
