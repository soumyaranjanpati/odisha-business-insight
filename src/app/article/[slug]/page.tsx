import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  canonicalUrl,
  truncateMetaDescription,
  schemaImage,
  getBaseUrl,
  SITE_NAME,
  DISCOVER_IMAGE_MIN_WIDTH,
  DISCOVER_IMAGE_MIN_HEIGHT,
} from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleBadges } from "@/components/article/ArticleBadges";
import { ShareBar } from "@/components/article/ShareBar";
import { PremiumCta } from "@/components/article/PremiumCta";
import { RecordArticleView } from "@/components/article/RecordArticleView";
import { hasActivePremiumSubscription } from "@/lib/subscription";
import { SidebarAds } from "@/components/SidebarAds";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Article" };

  const title = article.meta_title ?? article.title;
  const rawDesc = article.meta_description ?? article.excerpt ?? "";
  const description = truncateMetaDescription(rawDesc);
  const image = article.featured_image_url ?? undefined;
  const canonical = canonicalUrl(`/article/${slug}`);
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

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.category_id, 4);
  const category = article.category;
  const isPremium = article.is_premium ?? false;
  const hasPremiumAccess = await hasActivePremiumSubscription();
  const showGatedContent = isPremium && !hasPremiumAccess;

  const articleUrl = canonicalUrl(`/article/${article.slug}`);
  const baseUrl = getBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: truncateMetaDescription(
      article.meta_description ?? article.excerpt ?? article.title
    ),
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    image: article.featured_image_url
      ? schemaImage(article.featured_image_url, {
          width: DISCOVER_IMAGE_MIN_WIDTH,
          height: DISCOVER_IMAGE_MIN_HEIGHT,
        })
      : undefined,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    ...(article.tags?.length && {
      articleSection: category?.name,
      keywords: article.tags.map((t) => t.name).join(", "),
    }),
  };

  return (
    <>
      <RecordArticleView slug={article.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
        <article className="min-w-0 max-w-3xl">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            {category.name}
          </Link>
        )}
        <h1 className="headline mt-2 text-3xl font-bold text-ink sm:text-4xl">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <time dateTime={article.published_at ?? article.created_at}>
            {formatDate(article.published_at ?? article.created_at)}
          </time>
          {article.reading_time_minutes && (
            <span>{article.reading_time_minutes} min read</span>
          )}
          <ArticleBadges article={article} />
        </div>

        {article.featured_image_url && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={article.featured_image_url}
              alt={article.featured_image_alt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
              fetchPriority="high"
            />
          </div>
        )}

        {showGatedContent ? (
          <>
            {article.excerpt && (
              <div className="prose-obi mt-8">
                <p className="text-lg text-gray-600">{article.excerpt}</p>
              </div>
            )}
            <PremiumCta className="mt-8" />
          </>
        ) : (
          <div
            className="prose-obi mt-8"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        )}

        {/* Social sharing */}
        <ShareBar title={article.title} slug={article.slug} />
      </article>

        {/* Right sidebar: ads */}
        <div className="mt-6 lg:mt-0">
          <SidebarAds />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="headline mb-6 text-2xl font-bold text-ink">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

