import Link from "next/link";
import { getFeaturedArticles, getPublishedArticles } from "@/lib/db";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleListSkeleton } from "@/components/ui/Skeleton";
import { CATEGORY_NAV } from "@/lib/categories";
import { SidebarRight } from "@/components/SidebarRight";
import { SITE_NAME } from "@/lib/seo";
import { Suspense } from "react";

async function FeaturedSection() {
  const featured = await getFeaturedArticles(3);
  if (featured.length === 0) {
    return (
      <section aria-labelledby="top-stories-heading" className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
        <h2 id="top-stories-heading" className="sr-only">
          Top stories
        </h2>
        <p>No featured stories yet. Check back soon.</p>
      </section>
    );
  }
  return (
    <section aria-labelledby="top-stories-heading" aria-describedby="top-stories-desc">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 id="top-stories-heading" className="headline text-2xl font-bold text-ink sm:text-3xl">
          Top stories
        </h2>
        <p id="top-stories-desc" className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">
          Lead coverage and editor picks from Odisha&apos;s economy, business, and policy.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {featured[0] && (
          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-600">
              Lead story
            </p>
            <ArticleCard article={featured[0]} variant="featured" priority />
          </div>
        )}
        <div className="flex flex-col gap-6">
          {featured.slice(1, 3).length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 md:pt-1">
              Also in focus
            </p>
          )}
          {featured.slice(1, 3).map((a) => (
            <ArticleCard key={a.id} article={a} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}

async function LatestSection() {
  const { data: latest } = await getPublishedArticles({ limit: 6, offset: 3 });
  if (latest.length === 0) return null;
  return (
    <section aria-labelledby="latest-heading" aria-describedby="latest-desc">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 id="latest-heading" className="headline text-2xl font-bold text-ink sm:text-3xl">
          Latest from {SITE_NAME}
        </h2>
        <p id="latest-desc" className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">
          Recent reporting across economy, MSME, startups, policy, and markets.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
      <div className="min-w-0">
        {/* Categories strip */}
        <nav className="mb-10 flex flex-wrap gap-2">
          {CATEGORY_NAV.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-600"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Suspense fallback={<ArticleListSkeleton count={5} />}>
          <FeaturedSection />
        </Suspense>

        <div className="mt-12">
          <Suspense fallback={<ArticleListSkeleton count={6} />}>
            <LatestSection />
          </Suspense>
        </div>
      </div>

      {/* Right sidebar: ads + trending + newsletter */}
      <aside className="mt-6 lg:mt-0">
        <SidebarRight />
      </aside>
    </div>
  );
}
