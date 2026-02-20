import { createClient } from "@/lib/supabase/server";
import type { Article, Category, Tag } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  return (data ?? []) as Category[];
}

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name");
  return (data ?? []) as Tag[];
}

export async function getArticleBySlugForEditor(
  slug: string,
  authorId: string
): Promise<(Article & { tag_ids: string[] }) | null> {
  const supabase = await createClient();
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("author_id", authorId)
    .single();

  if (error || !article) return null;

  const { data: at } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", article.id);
  const tag_ids = (at ?? []).map((r) => r.tag_id);

  return { ...article, tag_ids } as Article & { tag_ids: string[] };
}
