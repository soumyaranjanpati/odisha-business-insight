import { unstable_cache } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache";

export type SidebarAd = {
  id: string;
  image_url: string;
  description: string | null;
  advertiser: string | null;
};

/** Ads that are active and within start_date..end_date. */
export async function getActiveSidebarAds(): Promise<SidebarAd[]> {
  return unstable_cache(
    async () => {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createServiceRoleClient()
        : await createClient();
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
        .map(({ start_date: _start, end_date: _end, ...ad }) => ad);
    },
    ["sidebar-ads"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.ads],
    }
  )();
}
