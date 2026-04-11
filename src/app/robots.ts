import type { MetadataRoute } from "next";
import { getCanonicalOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getCanonicalOrigin();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/editor/", "/admin/", "/login", "/auth/"] }],
    sitemap: [`${origin}/sitemap.xml`, `${origin}/news-sitemap.xml`],
  };
}
