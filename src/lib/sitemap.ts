/**
 * Dynamic sitemap XML builders. Data is fetched on each request (with short CDN cache via Route handlers).
 * Uses service role when configured so it works without cookies (serverless / edge).
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/seo";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Standard sitemap <urlset> with <loc> and <lastmod> (W3C / ISO 8601). */
export async function buildMainSitemapXml(): Promise<string> {
  const BASE = getBaseUrl();
  const now = new Date();

  const staticPaths = [
    "/",
    "/about",
    "/contact",
    "/search",
    "/subscribe",
    "/editorial-policy",
    "/privacy-policy",
    "/terms-of-use",
    "/corrections-policy",
    "/author/ranjan",
    "/author/priyanshu",
  ];

  const entries: { loc: string; lastmod: Date }[] = staticPaths.map((path) => ({
    loc: `${BASE}${path === "/" ? "" : path}`,
    lastmod: now,
  }));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return renderUrlset(entries);
  }

  const supabase = createServiceRoleClient();

  const [
    { data: articles },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("updated_at", { ascending: false }),
    supabase.from("categories").select("slug, updated_at").order("sort_order"),
  ]);

  for (const a of articles ?? []) {
    const row = a as { slug: string; updated_at: string };
    entries.push({
      loc: `${BASE}/${encodeURIComponent(row.slug)}`,
      lastmod: new Date(row.updated_at),
    });
  }

  for (const c of categories ?? []) {
    const row = c as { slug: string; updated_at: string };
    entries.push({
      loc: `${BASE}/category/${encodeURIComponent(row.slug)}`,
      lastmod: new Date(row.updated_at),
    });
  }

  return renderUrlset(entries);
}

function renderUrlset(entries: { loc: string; lastmod: Date }[]): string {
  const body = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${escapeXml(e.lastmod.toISOString())}</lastmod>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
