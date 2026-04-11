import Link from "next/link";
import { SITE_NAME, articlePublicPath } from "@/lib/seo";
import { SidebarAds } from "@/components/SidebarAds";
import { getPublishedArticles } from "@/lib/db";
import { NewsletterForm } from "@/components/article/NewsletterForm";
import type { ArticleWithRelations } from "@/types";

type SidebarRightProps = {
  trendingArticles?: ArticleWithRelations[];
};

export async function SidebarRight({ trendingArticles }: SidebarRightProps = {}) {
  const trending =
    trendingArticles ?? (await getPublishedArticles({ limit: 5, offset: 0 })).data;

  return (
    <aside className="space-y-8">
      <SidebarAds />

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Trending Articles
        </h3>
        <ul className="space-y-2">
          {trending.map((article) => (
            <li key={article.id}>
              <Link
                href={articlePublicPath(article.slug)}
                className="line-clamp-2 text-sm font-medium text-ink hover:text-primary-600"
              >
                {article.title}
              </Link>
              <p className="text-xs text-gray-500">
                {article.categories?.length
                  ? article.categories.map((c) => c.name).join(" · ")
                  : (article.category?.name ?? "News")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-ink">
          {`Get ${SITE_NAME} updates`}
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Subscribe to our monthly report and key business updates.
        </p>
        <div className="mt-3">
          <NewsletterForm />
        </div>
      </section>
    </aside>
  );
}

