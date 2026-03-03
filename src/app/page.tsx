import Link from "next/link";
import { getFeaturedArticles, getPublishedArticles } from "@/lib/db";
import { ArticleCard } from "@/components/article/ArticleCard";
import { NewsletterForm } from "@/components/article/NewsletterForm";
import { ArticleListSkeleton } from "@/components/ui/Skeleton";
import { CATEGORY_NAV } from "@/lib/categories";
import { SidebarAds } from "@/components/SidebarAds";
import { Suspense } from "react";

async function FeaturedSection() {
  const featured = await getFeaturedArticles(3);
  if (featured.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
        <p>No featured stories yet. Check back soon.</p>
      </section>
    );
  }
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {featured[0] && (
        <div className="md:col-span-2">
          <ArticleCard article={featured[0]} variant="featured" priority />
        </div>
      )}
      <div className="flex flex-col gap-6">
        {featured.slice(1, 3).map((a) => (
          <ArticleCard key={a.id} article={a} variant="compact" />
        ))}
      </div>
    </section>
  );
}

async function LatestSection() {
  const { data: latest } = await getPublishedArticles({ limit: 6, offset: 3 });
  if (latest.length === 0) return null;
  return (
    <section>
      <h2 className="headline mb-6 text-2xl font-bold text-ink">Latest Business News</h2>
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

        {/* Newsletter */}
        <section className="mt-16 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h2 className="headline text-xl font-semibold text-ink">Stay informed</h2>
          <p className="mt-1 text-sm text-gray-600">
            Subscribe to our newsletter for weekly business insights from Odisha.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </section>
      </div>

      {/* Right sidebar: ads */}
      <aside className="mt-6 lg:mt-0">
        <SidebarAds />
      </aside>
    </div>
  );
}
