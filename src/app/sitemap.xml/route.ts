import { buildMainSitemapXml } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

/** Dynamic /sitemap.xml — fresh DB-backed URLs + lastmod on every request; CDN may cache briefly. */
export async function GET() {
  const xml = await buildMainSitemapXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // ~5 min edge cache, serve stale up to ~15 min while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
