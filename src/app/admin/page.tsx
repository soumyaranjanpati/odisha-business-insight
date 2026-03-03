import Link from "next/link";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAdminAnalytics } from "@/lib/admin-analytics";

const ANALYTICS_DAYS = 30;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const adminClient = createServiceRoleClient();

  const [
    { count: articlesCount },
    { count: publishedCount },
    { count: pendingCount },
    { count: usersCount },
    { count: subscribersCount },
    { count: messagesCount },
    analytics,
  ] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    adminClient.from("contact_messages").select("id", { count: "exact", head: true }),
    getAdminAnalytics(ANALYTICS_DAYS),
  ]);

  const stats = [
    { label: "Total articles", value: articlesCount ?? 0, href: "/admin/articles" },
    { label: "Published", value: publishedCount ?? 0, href: "/admin/articles?status=published" },
    { label: "Pending review", value: pendingCount ?? 0, href: "/admin/articles?status=pending" },
    { label: "Users", value: usersCount ?? 0, href: "/admin/users" },
    { label: "Newsletter subscribers", value: subscribersCount ?? 0 },
    { label: "Contact messages", value: messagesCount ?? 0, href: "/admin/contact" },
  ];

  const maxDayViews = analytics?.by_day?.length
    ? Math.max(...analytics.by_day.map((d) => d.views), 1)
    : 1;
  const maxCategoryViews = analytics?.by_category?.length
    ? Math.max(...analytics.by_category.map((c) => c.views), 1)
    : 1;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
            </CardHeader>
            <CardContent>
              {s.href ? (
                <Link href={s.href} className="text-2xl font-bold text-ink hover:text-primary-600">
                  {s.value}
                </Link>
              ) : (
                <span className="text-2xl font-bold text-ink">{s.value}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Article views & analytics */}
      {analytics && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-ink">Analytics (last {ANALYTICS_DAYS} days)</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <span className="text-sm font-medium text-gray-500">Total article views</span>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-ink">
                  {analytics.total_views.toLocaleString()}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Top articles by views */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-ink">Top articles by views</h3>
              </CardHeader>
              <CardContent className="p-0">
                {analytics.top_articles?.length ? (
                  <ul className="divide-y divide-gray-200">
                    {analytics.top_articles.map((a) => (
                      <li key={a.article_id} className="flex items-center justify-between px-4 py-3">
                        <span className="min-w-0 flex-1">
                          <Link
                            href={`/article/${a.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-medium text-primary-600 hover:underline"
                          >
                            {a.title}
                          </Link>
                        </span>
                        <span className="ml-3 shrink-0 text-sm font-medium text-gray-600">
                          {a.views.toLocaleString()} views
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">No views yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Popular categories */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-ink">Popular categories</h3>
              </CardHeader>
              <CardContent className="p-0">
                {analytics.by_category?.length ? (
                  <ul className="divide-y divide-gray-200 px-4 py-2">
                    {analytics.by_category.map((c) => (
                      <li key={c.category_id} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/category/${c.category_slug ?? c.category_id}`}
                            className="font-medium text-primary-600 hover:underline"
                          >
                            {c.category_name}
                          </Link>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-primary-500"
                              style={{
                                width: `${Math.round((c.views / maxCategoryViews) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-gray-600">
                          {c.views.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">No category data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Growth trends: views by day */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="font-semibold text-ink">Growth trends (views per day)</h3>
            </CardHeader>
            <CardContent>
              {analytics.by_day?.length ? (
                <div className="space-y-2">
                  {[...analytics.by_day].reverse().slice(-14).map((d) => (
                    <div key={d.day} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm text-gray-600">
                        {new Date(d.day).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="h-6 w-full overflow-hidden rounded bg-gray-100">
                          <div
                            className="h-full rounded bg-primary-500"
                            style={{
                              width: `${Math.round((d.views / maxDayViews) * 100)}%`,
                              minWidth: d.views > 0 ? "4px" : "0",
                            }}
                          />
                        </div>
                      </div>
                      <span className="w-16 shrink-0 text-right text-sm font-medium text-gray-600">
                        {d.views.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">No view data yet.</p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {!analytics && (
        <section className="mt-10">
          <Card>
            <CardContent className="py-8 text-center text-sm text-gray-500">
              Analytics require the <code className="rounded bg-gray-100 px-1">article_views</code>{" "}
              table and <code className="rounded bg-gray-100 px-1">get_admin_analytics</code> RPC.
              Run migration 004.
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
