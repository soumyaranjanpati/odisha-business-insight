/**
 * SEO utilities: Google Discover, meta, and structured data helpers.
 * Discover favors: 150–160 char descriptions, 1200px+ images, fresh content, canonical URLs.
 */

const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://odisha-business-insight.vercel.app";

/** Max meta description length for Google (Discover & SERP). */
const META_DESCRIPTION_MAX = 160;

/** Recommended min width for Discover / Open Graph images (px). */
export const DISCOVER_IMAGE_MIN_WIDTH = 1200;
export const DISCOVER_IMAGE_MIN_HEIGHT = 630;

export function getBaseUrl(): string {
  return DEFAULT_BASE;
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

export const SITE_NAME = "Odisha Business Insight";
export const SITE_DESCRIPTION =
  "Your trusted source for business news, economy, MSME, startups, policy and infrastructure updates from Odisha.";
