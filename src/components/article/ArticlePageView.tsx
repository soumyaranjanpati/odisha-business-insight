import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleViewsCount,
  getAuthorDisplayNameForStaff,
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/lib/db";
import { getProfile } from "@/lib/auth";
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
import { PremiumCta } from "@/components/article/PremiumCta";
import { RecordArticleView } from "@/components/article/RecordArticleView";
import { hasActivePremiumSubscription } from "@/lib/subscription";
import { ArticleBreadcrumbs } from "@/components/article/Breadcrumbs";
import { SidebarRight } from "@/components/SidebarRight";

export async function ArticlePageView({ slug }: { slug: string }) {
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 5);
  const category = article.category;
  const isPremium = article.is_premium ?? false;
  const hasPremiumAccess = await hasActivePremiumSubscription();
  const showGatedContent = isPremium && !hasPremiumAccess;

  const profile = await getProfile();
  const isEditorialStaff =
    profile?.roleName === "editor" || profile?.roleName === "admin";
  const staffPosterName =
    isEditorialStaff && article.author_id
      ? await getAuthorDisplayNameForStaff(article.author_id)
      : null;
  const articleViewsCount = await getArticleViewsCount(article.id);

  const articleUrl = articleCanonicalUrl(article.slug);
  const baseUrl = getBaseUrl();
  const bylineName = article.author_name?.trim();
  const bylineSlug = article.author_slug?.trim();

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
            {staffPosterName && (
              <span
                className="text-xs text-gray-600 sm:text-sm"
                title="Visible to editors and admins only"
              >
                Added by{" "}
                <span className="font-medium text-gray-700">{staffPosterName}</span>
              </span>
            )}
            {category && (
              <>
                {staffPosterName && <span aria-hidden>•</span>}
                <Link href={`/category/${category.slug}`} className="hover:underline">
                  {category.name}
                </Link>
              </>
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
            <div className="mt-6 overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={article.featured_image_url}
                alt={article.featured_image_alt ?? article.title}
                width={1200}
                height={800}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                fetchPriority="high"
              />
            </div>
          )}

          {showGatedContent ? (
            <>
              {article.excerpt && (
                <div className="mt-8 rounded-r-lg border-l-4 border-primary-500 bg-primary-50/60 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">
                    Summary
                  </p>
                  <p className="mt-2 whitespace-pre-line text-lg leading-relaxed text-gray-800">
                    {article.excerpt}
                  </p>
                </div>
              )}
              <PremiumCta className="mt-8" />
            </>
          ) : (
            <>
              {article.excerpt && (
                <div className="mt-8 rounded-r-lg border-l-4 border-primary-500 bg-primary-50/60 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">
                    Summary
                  </p>
                  <p className="mt-2 whitespace-pre-line text-lg leading-relaxed text-gray-800">
                    {article.excerpt}
                  </p>
                </div>
              )}
              <div
                className="prose-obi mt-8"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
              {article.why_this_matters?.trim() && (
                <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                    Why This Matters for Odisha
                  </p>
                  <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-gray-900">
                    {article.why_this_matters.trim()}
                  </p>
                </div>
              )}
              {article.source?.trim() && (
                <p className="mt-8 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Source: </span>
                  {article.source.trim()}
                </p>
              )}
              <p className="mt-6 text-sm text-gray-600">
                <span className="font-medium text-gray-800">By </span>
                {bylineName && bylineSlug ? (
                  <Link
                    href={`/author/${bylineSlug}`}
                    className="font-medium text-primary-700 hover:underline"
                  >
                    {bylineName}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800">{SITE_NAME}</span>
                )}
              </p>
            </>
          )}

          <ShareBar title={article.title} slug={article.slug} />
        </article>

        <div className="mt-6 lg:mt-0">
          <SidebarRight />
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
