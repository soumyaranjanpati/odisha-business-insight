/** Shared cache tags for `unstable_cache` / `revalidateTag`. */
export const CACHE_TAGS = {
  articles: "articles",
  categories: "categories",
  ads: "ads",
} as const;

/** Default ISR / data cache window for public content (seconds). */
export const PUBLIC_REVALIDATE_SECONDS = 60;
