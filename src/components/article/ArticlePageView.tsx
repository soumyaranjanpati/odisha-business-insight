import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleViewsCount,
  getPublishedArticleBySlug,
  getPublishedArticles,
  getRelatedArticles,
} from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  articleCanonicalUrl,
  canonicalUrl,
  truncateMetaDescription,
  getBaseUrl,
  SITE_NAME,
} from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleBadges } from "@/components/article/ArticleBadges";
import { ShareBar } from "@/components/article/ShareBar";
import { RecordArticleView } from "@/components/article/RecordArticleView";
import { ArticleBreadcrumbs } from "@/components/article/Breadcrumbs";
import { SidebarRight } from "@/components/SidebarRight";
import { ArticlePremiumBody } from "@/components/article/ArticlePremiumBody";
import { ArticleStaffMeta } from "@/components/article/ArticleStaffMeta";

export async function ArticlePageView({ slug }: { slug: string }) {
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const [related, trending, articleViewsCount] = await Promise.all([
    getRelatedArticles(article, 5),
    getPublishedArticles({ limit: 5, offset: 0 }).then((r) => r.data),
    getArticleViewsCount(article.id),
  ]);

  const category = article.category;
  const bylineName = article.author_name?.trim() ?? null;
  const bylineSlug = article.author_slug?.trim() ?? null;

  const articleUrl = articleCanonicalUrl(article.slug);
  const baseUrl = getBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: truncateMetaDescription(
      article.meta_description?.trim() || article.excerpt?.trim() || article.title
    ),
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    ...(article.featured_image_url && {
      image: [article.featured_image_url],
    }),
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author:
      bylineName && bylineSlug
        ? {
            "@type": "Person",
            name: bylineName,
            url: canonicalUrl(`/author/${bylineSlug}`),
          }
        : {
            "@type": "Organization",
            name: SITE_NAME,
            url: baseUrl,
          },
    publisher: {
      "@type": "Organization",
      name: "Odisha Economy",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
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
          <ArticleBreadcrumbs
            categorySlug={category?.slug}
            categoryName={category?.name}
            articleTitle={article.title}
            articleSlug={article.slug}
          />
          <h1 className="headline mt-1 text-3xl font-bold text-ink sm:mt-2 sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
            <span>
              Published{" "}
              <time dateTime={article.published_at ?? article.created_at} className="font-medium text-gray-800">
                {formatDate(article.published_at ?? article.created_at)}
              </time>
            </span>
            <span aria-hidden className="text-gray-300">
              |
            </span>
            <span>
              Updated{" "}
              <time dateTime={article.updated_at} className="font-medium text-gray-800">
                {formatDate(article.updated_at)}
              </time>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <ArticleStaffMeta authorId={article.author_id} />
            {category && (
              <Link href={`/category/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
            )}
            {article.reading_time_minutes && (
              <>
                <span aria-hidden>•</span>
                <span>{article.reading_time_minutes} min read</span>
              </>
            )}
            {articleViewsCount !== null && (
              <>
                <span aria-hidden>•</span>
                <span>{articleViewsCount.toLocaleString()} views</span>
              </>
            )}
            <ArticleBadges article={article} />
          </div>

          {article.featured_image_url && (
            <div className="mt-6 overflow-hidden rounded-xl bg-gray-100 md:w-[63%]">
              <Image
                src={article.featured_image_url}
                alt={article.featured_image_alt ?? article.title}
                width={1200}
                height={800}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 63vw"
                priority
                fetchPriority="high"
              />
            </div>
          )}

          <ArticlePremiumBody
            isPremium={article.is_premium ?? false}
            excerpt={article.excerpt}
            body={article.body}
            whyThisMatters={article.why_this_matters ?? null}
            source={article.source ?? null}
            bylineName={bylineName}
            bylineSlug={bylineSlug}
          />

          <ShareBar title={article.title} slug={article.slug} />
        </article>

        <div className="mt-6 lg:mt-0">
          <SidebarRight trendingArticles={trending} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="headline mb-6 text-2xl font-bold text-ink">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
