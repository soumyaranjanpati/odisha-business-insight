import Link from "next/link";
import { SidebarAds } from "@/components/SidebarAds";
import { getPublishedArticles } from "@/lib/db";
import { NewsletterForm } from "@/components/article/NewsletterForm";

export async function SidebarRight() {
  const { data: trending } = await getPublishedArticles({ limit: 5, offset: 0 });

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
                href={`/article/${article.slug}`}
                className="line-clamp-2 text-sm font-medium text-ink hover:text-primary-600"
              >
                {article.title}
              </Link>
              <p className="text-xs text-gray-500">
                {article.category?.name ?? "News"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-ink">
          Get Odisha Business Insights
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

