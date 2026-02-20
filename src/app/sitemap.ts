import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/sitemap";

/**
 * Dynamic sitemap: fetched on each request so new articles appear as soon as published.
 * Uses service role client (no auth/cookies) so it works in serverless and at build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
