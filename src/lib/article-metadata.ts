import type { Metadata } from "next";
import { getPublishedArticleBySlug } from "@/lib/db";
import {
  articleCanonicalUrl,
  SITE_NAME,
  truncateMetaDescription,
  DISCOVER_IMAGE_MIN_WIDTH,
  DISCOVER_IMAGE_MIN_HEIGHT,
} from "@/lib/seo";

/**
 * Shared metadata for article pages (/[slug] and /article/[slug]).
 */
export async function generateArticlePageMetadata(slug: string): Promise<Metadata> {
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Article" };

  const title = article.meta_title?.trim() || article.title;
  const summary =
    article.meta_description?.trim() || article.excerpt?.trim() || "";
  const description = truncateMetaDescription(summary);
  const image = article.featured_image_url ?? undefined;
  const canonical = articleCanonicalUrl(slug);
  const section = article.category?.name;
  const tags = article.tags?.map((t) => t.name) ?? [];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      section: section ?? undefined,
      tags: tags.length ? tags : undefined,
      images: image
        ? [
            {
              url: image,
              alt: article.featured_image_alt ?? article.title,
              width: DISCOVER_IMAGE_MIN_WIDTH,
              height: DISCOVER_IMAGE_MIN_HEIGHT,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  };
}
