import { createClient } from "@/lib/supabase/server";

export type SidebarAd = {
  id: string;
  image_url: string;
  description: string | null;
  advertiser: string | null;
};

/** Ads that are active and within start_date..end_date. */
export async function getActiveSidebarAds(): Promise<SidebarAd[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("advertisements")
    .select("id, image_url, description, advertiser, start_date, end_date")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return [];
  const rows = (data ?? []) as (SidebarAd & { start_date: string | null; end_date: string | null })[];
  return rows
    .filter((r) => {
      if (r.start_date && r.start_date > today) return false;
      if (r.end_date && r.end_date < today) return false;
      return true;
    })
    .map(({ start_date, end_date, ...ad }) => ad);
}
