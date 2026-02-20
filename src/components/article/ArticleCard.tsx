import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ArticleBadges } from "@/components/article/ArticleBadges";
import type { ArticleWithRelations } from "@/types";

interface ArticleCardProps {
  article: ArticleWithRelations;
  variant?: "default" | "featured" | "compact";
  /** Set for the first card on a page to improve LCP (e.g. homepage hero). */
  priority?: boolean;
}

export function ArticleCard({ article, variant = "default", priority = false }: ArticleCardProps) {
  const href = `/article/${article.slug}`;
  const category = article.category;

  if (variant === "featured") {
    return (
      <Link href={href} className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          {article.featured_image_url ? (
            <Image
              src={article.featured_image_url}
              alt={article.featured_image_alt ?? article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={priority}
              fetchPriority={priority ? "high" : undefined}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400">
              <span className="text-sm">No image</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white">
              {category?.name ?? "News"}
            </span>
            <ArticleBadges article={article} />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <time className="text-sm text-gray-500">
            {article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}
          </time>
          <h2 className="headline mt-1 text-xl font-bold text-ink group-hover:text-primary-600 sm:text-2xl">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{article.excerpt}</p>
          )}
          {article.reading_time_minutes && (
            <span className="mt-2 inline-block text-xs text-gray-500">
              {article.reading_time_minutes} min read
            </span>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex gap-3 border-b border-gray-100 py-4 last:border-0">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-36">
          {article.featured_image_url ? (
            <Image
              src={article.featured_image_url}
              alt={article.featured_image_alt ?? article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="150px"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-medium text-primary-600">{category?.name}</span>
            <ArticleBadges article={article} inline />
          </div>
          <h3 className="headline mt-0.5 font-semibold text-ink line-clamp-2 group-hover:text-primary-600">
            {article.title}
          </h3>
          <time className="text-xs text-gray-500">
            {article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}
          </time>
        </div>
      </Link>
    );
  }

  // default
  return (
    <Link href={href} className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        {article.featured_image_url ? (
          <Image
            src={article.featured_image_url}
            alt={article.featured_image_alt ?? article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400 text-sm">
            No image
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
          <span className="rounded bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
            {category?.name ?? "News"}
          </span>
          <ArticleBadges article={article} />
        </div>
      </div>
      <div className="p-4">
        <time className="text-sm text-gray-500">
          {article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}
        </time>
        <h2 className="headline mt-1 font-bold text-ink line-clamp-2 group-hover:text-primary-600">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{article.excerpt}</p>
        )}
        {article.reading_time_minutes && (
          <span className="mt-2 inline-block text-xs text-gray-500">
            {article.reading_time_minutes} min read
          </span>
        )}
      </div>
    </Link>
  );
}
