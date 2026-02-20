import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { ApproveRejectButtons } from "./ApproveRejectButtons";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title, slug, status, created_at, published_at, author_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);

  const { data: articles, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load articles.
      </div>
    );
  }

  const list = articles ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">All Articles</h1>
      <div className="mb-4 flex gap-2">
        <Link
          href="/admin/articles"
          className={`rounded px-3 py-1.5 text-sm ${!status ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          All
        </Link>
        <Link
          href="/admin/articles?status=pending"
          className={`rounded px-3 py-1.5 text-sm ${status === "pending" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Pending
        </Link>
        <Link
          href="/admin/articles?status=published"
          className={`rounded px-3 py-1.5 text-sm ${status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Published
        </Link>
        <Link
          href="/admin/articles?status=draft"
          className={`rounded px-3 py-1.5 text-sm ${status === "draft" ? "bg-gray-200 text-ink" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Draft
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-ink">Title</th>
                <th className="px-4 py-3 font-medium text-ink">Author</th>
                <th className="px-4 py-3 font-medium text-ink">Status</th>
                <th className="px-4 py-3 font-medium text-ink">Created</th>
                <th className="px-4 py-3 font-medium text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a: { id: string; title: string; slug: string; status: string; created_at: string; published_at: string | null; author_id: string }) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/article/${a.slug}`}
                      target="_blank"
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {a.author_id?.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        a.status === "published"
                          ? "bg-green-100 text-green-800"
                          : a.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="text-primary-600 hover:underline"
                      >
                        Edit
                      </Link>
                      {a.status === "pending" && (
                        <ApproveRejectButtons articleId={a.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">No articles found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
