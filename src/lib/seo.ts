/**
 * SEO utilities: Google Discover, meta, and structured data helpers.
 * Discover favors: 150–160 char descriptions, 1200px+ images, fresh content, canonical URLs.
 */

/** Set NEXT_PUBLIC_SITE_URL in production (e.g. https://odishaeconomy.com) for canonicals, OG, and sitemap. */
const DEFAULT_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://odishaeconomy.com";

/** Max meta description length for Google (Discover & SERP). */
const META_DESCRIPTION_MAX = 160;

/** Recommended min width for Discover / Open Graph images (px). */
export const DISCOVER_IMAGE_MIN_WIDTH = 1200;
export const DISCOVER_IMAGE_MIN_HEIGHT = 630;

export function getBaseUrl(): string {
  return DEFAULT_BASE;
}

/** Canonical origin for WebSite JSON-LD (Google prefers consistent www for odishaeconomy.com). */
export function getWebSiteSchemaUrl(): string {
  try {
    const url = new URL(getBaseUrl());
    if (url.hostname === "odishaeconomy.com") {
      url.hostname = "www.odishaeconomy.com";
    }
    const origin = url.origin.replace(/\/$/, "");
    return `${origin}/`;
  } catch {
    return "https://www.odishaeconomy.com/";
  }
}

/** Truncate to meta description length without cutting words. */
export function truncateMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

/** Canonical URL for a path (no trailing slash). */
export function canonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${DEFAULT_BASE}${p}`;
}

/** Build NewsArticle / Article image for schema (Discover prefers 1200x630). */
export function schemaImage(
  url: string,
  options: { width?: number; height?: number; alt?: string } = {}
): { "@type": "ImageObject"; url: string; width?: number; height?: number } {
  const img: { "@type": "ImageObject"; url: string; width?: number; height?: number } = {
    "@type": "ImageObject",
    url,
  };
  if (options.width) img.width = options.width;
  if (options.height) img.height = options.height;
  return img;
}

export const SITE_NAME = "Odisha Economy";
/** Shown in header; keep concise for mobile. */
export const SITE_TAGLINE = "Tracking Growth. Powering Business.";
export const SITE_DESCRIPTION =
  "Latest news and insights on Odisha's economy, business, startups, and policy developments.";
