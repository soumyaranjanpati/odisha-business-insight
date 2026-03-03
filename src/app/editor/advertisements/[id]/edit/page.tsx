import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { AdvertisementForm } from "../../AdvertisementForm";

export const dynamic = "force-dynamic";

export default async function EditAdvertisementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/auth/login?redirect=/editor/advertisements");
  if (profile.roleName !== "editor" && profile.roleName !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: ad, error } = await supabase
    .from("advertisements")
    .select("id, image_url, description, advertiser, amount_per_month, total_amount, start_date, end_date, is_active")
    .eq("id", id)
    .single();

  if (error || !ad) {
    redirect("/editor/advertisements");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Edit Advertisement</h1>
        <Link
          href="/editor/advertisements"
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          ← Manage Advz
        </Link>
      </div>
      <AdvertisementForm
        ad={{
          ...ad,
          amount_per_month: ad.amount_per_month != null ? Number(ad.amount_per_month) : null,
          total_amount: ad.total_amount != null ? Number(ad.total_amount) : null,
        }}
      />
    </div>
  );
}
