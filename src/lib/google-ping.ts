import { getGoogleNewsPingUrl } from "@/lib/seo";

/**
 * Notify Google that the news sitemap changed (non-blocking).
 * Safe to call after publish; failures are ignored.
 */
export function pingGoogleNewsSitemap(): void {
  const url = getGoogleNewsPingUrl();
  void fetch(url, { method: "GET", cache: "no-store" }).catch(() => {});
}
