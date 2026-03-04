import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedArticles, getCategories } from "@/lib/db";
import { canonicalUrl, SITE_NAME } from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleListSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Category pages are dynamic (getCategories uses request-scoped Supabase).
// Omit generateStaticParams to avoid cookies() outside request scope.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category" };
  const title = `${category.name} | ${SITE_NAME}`;
  const description =
    category.description ??
    `Latest ${category.name} business news, economy and policy updates from Odisha.`;
  const url = canonicalUrl(`/category/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const PER_PAGE = 12;

async function CategoryContent({ slug, page }: { slug: string; page: number }) {
  const { data: articles, total } = await getPublishedArticles({
    categorySlug: slug,
    limit: PER_PAGE,
    offset: page * PER_PAGE,
  });
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const totalPages = Math.ceil(total / PER_PAGE);
  const hasMore = page < totalPages - 1;
  const currentPage = page + 1;

  return (
    <>
      <div className="mb-6">
        <h1 className="headline text-3xl font-bold text-ink">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          No articles in this category yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 0 && (
            <a
              href={`/category/${slug}?page=${page}`}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          {hasMore && (
            <a
              href={`/category/${slug}?page=${currentPage}`}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </a>
          )}
        </nav>
      )}
    </>
  );
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(0, parseInt(pageStr ?? "0", 10) || 0);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<ArticleListSkeleton count={6} />}>
        <CategoryContent slug={slug} page={page} />
      </Suspense>
    </div>
  );
}
