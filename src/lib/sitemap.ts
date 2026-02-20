/**
 * Dynamic sitemap data using service role so it runs without request context
 * (e.g. on Vercel serverless or build). Ensures all published articles and
 * categories are included with correct lastModified.
 * When env is missing (e.g. at build), returns static URLs only so build succeeds.
 */

import type { MetadataRoute } from "next";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/seo";

const BASE = getBaseUrl();

const staticEntries: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  { url: `${BASE}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
];

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return staticEntries;
  }

  const supabase = createServiceRoleClient();

  const [
    { data: articles },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("updated_at", { ascending: false }),
    supabase.from("categories").select("slug, updated_at").order("sort_order"),
  ]);

  const articleUrls = (articles ?? []).map((a: { slug: string; updated_at: string }) => ({
    url: `${BASE}/article/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories ?? []).map((c: { slug: string; updated_at: string }) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...categoryUrls,
    ...articleUrls,
  ];
}
