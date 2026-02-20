import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default async function EditorDashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, status, created_at, updated_at, published_at")
    .eq("author_id", profile!.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load articles. Please try again.
      </div>
    );
  }

  const list = articles ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">My Articles</h1>
        <Link href="/editor/new">
          <Button>New Article</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <p>You haven&apos;t created any articles yet.</p>
            <Link href="/editor/new" className="mt-4 inline-block">
              <Button>Create your first article</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-ink">Articles</h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {list.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <Link
                      href={`/editor/edit/${a.slug}`}
                      className="font-medium text-ink hover:text-primary-600"
                    >
                      {a.title}
                    </Link>
                    <div className="mt-1 flex gap-3 text-sm text-gray-500">
                      <span>Status: {a.status}</span>
                      <span>Updated: {formatDate(a.updated_at)}</span>
                      {a.published_at && (
                        <span>Published: {formatDate(a.published_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {a.status === "published" && (
                      <a
                        href={`/article/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                    <Link
                      href={`/editor/edit/${a.slug}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
