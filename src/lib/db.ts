import { createClient } from "@/lib/supabase/server";
import type { ArticleWithRelations } from "@/types";

/**
 * Fetch published articles with category and tags.
 */
export async function getPublishedArticles(options: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const supabase = await createClient();
  const { limit = 10, offset = 0, categorySlug, tagSlug } = options;

  let query = supabase
    .from("articles")
    .select(
      `
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `
    )
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (tagSlug) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();
    if (tag) {
      const { data: articleIds } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tag.id);
      const ids = articleIds?.map((r) => r.article_id) ?? [];
      if (ids.length) query = query.in("id", ids);
      else return { data: [], total: 0 };
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPublishedArticles error:", error);
    return { data: [], total: 0 };
  }

  const articles = normalizeArticles(data ?? []);
  return { data: articles, total: articles.length };
}

function normalizeArticles(rows: Record<string, unknown>[]): ArticleWithRelations[] {
  return rows.map((row) => {
    const tags = (row.tags as { tag: unknown }[] | undefined) ?? [];
    return {
      ...row,
      category: Array.isArray(row.category) ? row.category[0] : row.category,
      tags: tags.map((t) => (t as { tag: unknown }).tag).filter(Boolean),
    };
  }) as ArticleWithRelations[];
}

/**
 * Fetch a single published article by slug.
 */
export async function getPublishedArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  const [normalized] = normalizeArticles([data as Record<string, unknown>]);
  return normalized ?? null;
}

/**
 * Related articles: same category, excluding current, limit 4.
 */
export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `
    )
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", articleId)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return normalizeArticles((data ?? []) as Record<string, unknown>[]);
}

/**
 * Fetch featured / top stories (first N published).
 */
export async function getFeaturedArticles(limit = 3) {
  const result = await getPublishedArticles({ limit, offset: 0 });
  return result.data;
}

/**
 * Fetch all categories for nav/footer.
 */
export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return data ?? [];
}

/**
 * Search published articles by title/excerpt (simple ilike).
 */
export async function searchArticles(q: string, limit = 20) {
  if (!q?.trim()) return { data: [], total: 0 };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `
    )
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .or(`title.ilike.%${q.trim()}%,excerpt.ilike.%${q.trim()}%,body.ilike.%${q.trim()}%`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], total: 0 };
  const articles = normalizeArticles((data ?? []) as Record<string, unknown>[]);
  return { data: articles, total: articles.length };
}
