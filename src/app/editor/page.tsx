import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PostActions } from "./PostActions";

export default async function EditorDashboardPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/auth/login?redirect=/editor&error=profile");
  }
  const isAdmin = profile.roleName === "admin";
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, status, author_id, created_at, updated_at, published_at")
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">My Posts</h1>
        <Link href="/editor/new">
          <Button className="bg-primary-600 hover:bg-primary-700">Add Post</Button>
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        All posts you can see. Yours are marked <span className="font-medium text-ink">Mine</span>. You can only edit or delete your own posts.
      </p>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <p className="font-medium text-ink">No posts yet</p>
            <p className="mt-1 text-sm">Create your first post to get started.</p>
            <Link href="/editor/new" className="mt-4 inline-block">
              <Button>Add Post</Button>
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
              {list.map((a) => {
                const isMine = a.author_id === profile.id;
                const canEdit = isAdmin || isMine;
                return (
                  <li key={a.id} className="flex items-center justify-between px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={canEdit ? `/editor/edit/${a.slug}` : "#"}
                          className={`font-medium text-ink hover:text-primary-600 ${!canEdit ? "pointer-events-none" : ""}`}
                        >
                          {a.title}
                        </Link>
                        {isMine && (
                          <span className="shrink-0 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                            Mine
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>Status: {a.status}</span>
                        <span>Updated: {formatDate(a.updated_at)}</span>
                        {a.published_at && (
                          <span>Published: {formatDate(a.published_at)}</span>
                        )}
                      </div>
                    </div>
                    <PostActions
                      slug={a.slug}
                      articleId={a.id}
                      status={a.status}
                      canEdit={canEdit}
                    />
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
