import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getTags } from "@/lib/editor-db";
import { ArticleForm } from "@/app/editor/ArticleForm";
import type { Article } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) notFound();

  const { data: at } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", id);
  const tag_ids = (at ?? []).map((r) => r.tag_id);

  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Edit Article (Admin)</h1>
      <ArticleForm
        categories={categories}
        tags={tags}
        article={{ ...article, tag_ids } as Article & { tag_ids: string[] }}
      />
    </div>
  );
}
