import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache";
import type { ArticleWithRelations, Category } from "@/types";

const ARTICLE_RELATIONS = `
  category:categories!articles_category_id_fkey(*),
  article_categories(category:categories(*)),
  tags:article_tags(tag:tags(*))
`;

/** List/card views — excludes heavy `body` HTML. */
const ARTICLE_LIST_SELECT = `
  id, author_id, category_id, title, slug, excerpt, featured_image_url, featured_image_alt,
  status, published_at, reading_time_minutes, meta_title, meta_description,
  why_this_matters, source, author_name, author_slug, is_premium, is_sponsored, sponsored_by,
  created_at, updated_at,
  ${ARTICLE_RELATIONS}
`;

/** Single-article view — includes full body. */
const ARTICLE_DETAIL_SELECT = `
  *,
  ${ARTICLE_RELATIONS}
`;

function getPublicReadClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceRoleClient();
  }
  return null;
}

function extractCategoriesFromRow(row: Record<string, unknown>): Category[] {
  const primary = Array.isArray(row.category) ? row.category[0] : row.category;
  const junction =
    (row.article_categories as { category: Category | null }[] | undefined) ?? [];
  const fromJunction = junction.map((j) => j.category).filter((c): c is Category => Boolean(c));
  const byId = new Map<string, Category>();
  if (primary && typeof primary === "object" && "id" in primary) {
    const p = primary as Category;
    byId.set(p.id, p);
  }
  for (const c of fromJunction) {
    if (c?.id) byId.set(c.id, c);
  }
  return [...byId.values()].sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeArticles(rows: Record<string, unknown>[]): ArticleWithRelations[] {
  return rows.map((row) => {
    const tags = (row.tags as { tag: unknown }[] | undefined) ?? [];
    const { article_categories, ...rest } = row;
    void article_categories;
    return {
      ...rest,
      body: typeof row.body === "string" ? row.body : "",
      category: Array.isArray(row.category) ? row.category[0] : row.category,
      categories: extractCategoriesFromRow(row),
      tags: tags.map((t) => (t as { tag: unknown }).tag).filter(Boolean),
    };
  }) as ArticleWithRelations[];
}

async function fetchPublishedArticles(options: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const supabase = getPublicReadClient() ?? (await createClient());
  const { limit = 10, offset = 0, categorySlug, tagSlug } = options;
  const now = new Date().toISOString();

  let idFilter: string[] | null = null;

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (!cat) return { data: [], total: 0 };

    const ids = new Set<string>();
    const { data: junctionRows } = await supabase
      .from("article_categories")
      .select("article_id")
      .eq("category_id", cat.id);
    for (const r of junctionRows ?? []) ids.add(r.article_id);

    const { data: primaryRows } = await supabase
      .from("articles")
      .select("id")
      .eq("category_id", cat.id);
    for (const r of primaryRows ?? []) ids.add(r.id);

    idFilter = [...ids];
    if (!idFilter.length) return { data: [], total: 0 };
  }

  if (tagSlug) {
    const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).single();
    if (!tag) return { data: [], total: 0 };
    const { data: tagLinks } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tag.id);
    const tagIds = new Set<string>((tagLinks ?? []).map((r: { article_id: string }) => r.article_id));

    if (idFilter !== null) {
      idFilter = idFilter.filter((id) => tagIds.has(id));
    } else {
      idFilter = [...tagIds];
    }
    if (!idFilter.length) return { data: [], total: 0 };
  }

  let dataQuery = supabase
    .from("articles")
    .select(ARTICLE_LIST_SELECT)
    .eq("status", "published")
    .lte("published_at", now)
    .order("published_at", { ascending: false });

  if (idFilter !== null) {
    dataQuery = dataQuery.in("id", idFilter);
  }

  let countQuery = supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .lte("published_at", now);

  if (idFilter !== null) {
    countQuery = countQuery.in("id", idFilter);
  }

  const [{ count: totalCount, error: countError }, { data, error }] = await Promise.all([
    countQuery,
    dataQuery.range(offset, offset + limit - 1),
  ]);

  if (countError) {
    console.error("getPublishedArticles count error:", countError);
  }
  if (error) {
    console.error("getPublishedArticles error:", error);
    return { data: [], total: 0 };
  }

  const articles = normalizeArticles(data ?? []);
  return { data: articles, total: totalCount ?? articles.length };
}

/**
 * Fetch published articles with category and tags.
 * Category filter includes any article linked in `article_categories` OR whose primary `category_id` matches
 * (so multi-category posts appear on every selected category page).
 */
export async function getPublishedArticles(options: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const cacheKey = JSON.stringify(options);
  return unstable_cache(() => fetchPublishedArticles(options), ["published-articles", cacheKey], {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.articles],
  })();
}

async function fetchPublishedArticleBySlug(slug: string) {
  const supabase = getPublicReadClient() ?? (await createClient());
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  const [normalized] = normalizeArticles([data as Record<string, unknown>]);
  return normalized ?? null;
}

/**
 * Fetch a single published article by slug.
 * Wrapped in React `cache()` so metadata + page share one fetch per request.
 */
export const getPublishedArticleBySlug = cache(async (slug: string) => {
  return unstable_cache(() => fetchPublishedArticleBySlug(slug), ["published-article", slug], {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.articles, `article-${slug}`],
  })();
});

/**
 * Related articles: merge same-category and shared-tag matches, deduped, newest first.
 */
export async function getRelatedArticles(article: ArticleWithRelations, limit = 5) {
  const articleId = article.id;
  return unstable_cache(
    async () => {
      const supabase = getPublicReadClient() ?? (await createClient());
      const now = new Date().toISOString();
      const tagIds = article.tags?.map((t) => t.id).filter(Boolean) ?? [];

      const { data: byCategory } = await supabase
        .from("articles")
        .select(ARTICLE_LIST_SELECT)
        .eq("status", "published")
        .lte("published_at", now)
        .eq("category_id", article.category_id)
        .neq("id", articleId)
        .order("published_at", { ascending: false })
        .limit(18);

      let byTags: Record<string, unknown>[] = [];
      if (tagIds.length) {
        const { data: links } = await supabase
          .from("article_tags")
          .select("article_id")
          .in("tag_id", tagIds);

        const ids = [
          ...new Set(
            (links ?? [])
              .map((l: { article_id: string }) => l.article_id)
              .filter((id: string) => Boolean(id) && id !== articleId)
          ),
        ].slice(0, 30);

        if (ids.length) {
          const { data: tagArticles } = await supabase
            .from("articles")
            .select(ARTICLE_LIST_SELECT)
            .eq("status", "published")
            .lte("published_at", now)
            .in("id", ids)
            .order("published_at", { ascending: false })
            .limit(18);
          byTags = (tagArticles ?? []) as Record<string, unknown>[];
        }
      }

      const merged = new Map<string, Record<string, unknown>>();
      for (const row of [...byTags, ...((byCategory ?? []) as Record<string, unknown>[])]) {
        const id = row.id as string;
        if (id && !merged.has(id)) merged.set(id, row);
      }
      const combined = [...merged.values()].sort(
        (a, b) =>
          new Date((b.published_at as string) ?? 0).getTime() -
          new Date((a.published_at as string) ?? 0).getTime()
      );
      return normalizeArticles(combined.slice(0, limit));
    },
    ["related-articles", articleId, String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.articles, `article-${article.slug}`],
    }
  )();
}

/**
 * Published articles by public byline slug (for /author/:slug).
 */
export async function getPublishedArticlesByAuthorSlug(authorSlug: string, limit = 50) {
  return unstable_cache(
    async () => {
      const supabase = getPublicReadClient() ?? (await createClient());
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("articles")
        .select(ARTICLE_LIST_SELECT)
        .eq("status", "published")
        .eq("author_slug", authorSlug)
        .lte("published_at", now)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("getPublishedArticlesByAuthorSlug:", error);
        return [];
      }
      return normalizeArticles((data ?? []) as Record<string, unknown>[]);
    },
    ["author-articles", authorSlug, String(limit)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.articles],
    }
  )();
}

export type NewsSitemapEntry = {
  slug: string;
  title: string;
  published_at: string;
};

/**
 * Articles published in the last 48 hours (Google News sitemap), max 1000.
 */
export async function getArticlesForNewsSitemap(limit = 1000): Promise<NewsSitemapEntry[]> {
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleClient()
    : await createClient();
  const now = new Date();
  const since = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, published_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .gte("published_at", since.toISOString())
    .lte("published_at", now.toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getArticlesForNewsSitemap:", error);
    return [];
  }
  return (data ?? []) as NewsSitemapEntry[];
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
export async function getCategories(): Promise<Category[]> {
  return unstable_cache(
    async (): Promise<Category[]> => {
      const supabase = getPublicReadClient() ?? (await createClient());
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return [];
      return (data ?? []) as Category[];
    },
    ["categories"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.categories],
    }
  )();
}

/**
 * Search published articles by title/excerpt (simple ilike).
 */
export async function searchArticles(q: string, limit = 20) {
  if (!q?.trim()) return { data: [], total: 0 };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .or(`title.ilike.%${q.trim()}%,excerpt.ilike.%${q.trim()}%`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], total: 0 };
  const articles = normalizeArticles((data ?? []) as Record<string, unknown>[]);
  return { data: articles, total: articles.length };
}

/**
 * Resolve poster display name for editorial staff UI on article pages.
 * Call only when the viewer is editor/admin. Uses service role when configured so it works in production.
 */
export async function getAuthorDisplayNameForStaff(authorId: string): Promise<string | null> {
  if (!authorId) return null;
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleClient()
    : await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("display_name, email")
    .eq("id", authorId)
    .maybeSingle();
  if (error || !data) return null;
  const name = typeof data.display_name === "string" ? data.display_name.trim() : "";
  if (name) return name;
  const email = typeof data.email === "string" ? data.email.trim() : "";
  if (email) {
    const local = email.split("@")[0];
    return local || email;
  }
  return null;
}

/**
 * Get total lifetime views for one article.
 * Intended for editorial/admin UI only.
 */
export async function getArticleViewsCount(articleId: string): Promise<number | null> {
  if (!articleId) return null;
  return unstable_cache(
    async () => {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createServiceRoleClient()
        : await createClient();
      const { count, error } = await supabase
        .from("article_views")
        .select("id", { count: "exact", head: true })
        .eq("article_id", articleId);
      if (error) return null;
      return count ?? 0;
    },
    ["article-views", articleId],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.articles, `article-views-${articleId}`],
    }
  )();
}
