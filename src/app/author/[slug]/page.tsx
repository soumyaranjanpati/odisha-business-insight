import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticlesByAuthorSlug } from "@/lib/db";
export const revalidate = 60;
import { canonicalUrl, SITE_NAME } from "@/lib/seo";
import { AUTHOR_ROLE, getAuthorBySlug } from "@/lib/authors";
import { ArticleCard } from "@/components/article/ArticleCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author" };
  const title = `${author.name} | ${SITE_NAME}`;
  const description = author.bio;
  const url = canonicalUrl(`/author/${slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile", siteName: SITE_NAME },
    robots: { index: true, follow: true },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const articles = await getPublishedArticlesByAuthorSlug(author.slug, 48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Authors</span>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{author.name}</span>
      </nav>

      <header className="mt-6 max-w-3xl border-b border-gray-200 pb-8">
        <h1 className="headline text-3xl font-bold text-ink">{author.name}</h1>
        <p className="mt-2 text-sm font-medium text-primary-800">{AUTHOR_ROLE}</p>
        <p className="mt-4 text-lg leading-relaxed text-gray-700">{author.bio}</p>
      </header>

      <section className="mt-10">
        <h2 className="headline text-xl font-semibold text-ink">Articles</h2>
        {articles.length === 0 ? (
          <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            No published articles for this author yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
