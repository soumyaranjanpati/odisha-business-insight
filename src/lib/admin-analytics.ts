/**
 * Admin-only analytics: article views, popular categories, growth trends.
 * Calls Supabase RPC get_admin_analytics (requires admin role).
 */

import { createClient } from "@/lib/supabase/server";

export interface TopArticleRow {
  article_id: string;
  title: string;
  slug: string;
  views: number;
}

export interface CategoryViewsRow {
  category_id: string;
  category_name: string;
  category_slug: string;
  views: number;
}

export interface DayViewsRow {
  day: string;
  views: number;
}

export interface AdminAnalytics {
  total_views: number;
  top_articles: TopArticleRow[];
  by_category: CategoryViewsRow[];
  by_day: DayViewsRow[];
}

const DEFAULT_DAYS = 30;

export async function getAdminAnalytics(daysBack = DEFAULT_DAYS): Promise<AdminAnalytics | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_analytics", { days_back: daysBack });

  if (error) {
    console.error("get_admin_analytics error:", error);
    return null;
  }

  if (data?.error) return null;

  return {
    total_views: Number(data?.total_views ?? 0),
    top_articles: (data?.top_articles ?? []) as TopArticleRow[],
    by_category: (data?.by_category ?? []) as CategoryViewsRow[],
    by_day: (data?.by_day ?? []) as DayViewsRow[],
  };
}
