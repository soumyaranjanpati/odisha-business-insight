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

/**
 * Load article by slug for editor (own only) or admin (any).
 */
export async function getArticleBySlugForEditor(
  slug: string,
  userId: string,
  isAdmin: boolean
): Promise<(Article & { tag_ids: string[] }) | null> {
  const supabase = await createClient();
  let query = supabase.from("articles").select("*").eq("slug", slug);
  if (!isAdmin) {
    query = query.eq("author_id", userId);
  }
  const { data: article, error } = await query.single();

  if (error || !article) return null;

  const { data: at } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", article.id);
  const tag_ids = (at ?? []).map((r) => r.tag_id);

  return { ...article, tag_ids } as Article & { tag_ids: string[] };
}
