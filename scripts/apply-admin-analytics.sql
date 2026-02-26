-- Apply admin analytics (table + RPC). Run this in Supabase Dashboard → SQL Editor
-- if migration 004_article_views was not applied.

-- ============================================================
-- Article view tracking for analytics (admin dashboard)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_views_article ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_article_views_article_viewed ON public.article_views(article_id, viewed_at);

COMMENT ON TABLE public.article_views IS 'One row per article page view; used for admin analytics.';

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "article_views_insert_all" ON public.article_views;
CREATE POLICY "article_views_insert_all" ON public.article_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "article_views_select_admin" ON public.article_views;
CREATE POLICY "article_views_select_admin" ON public.article_views FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- Analytics aggregation for admin (one RPC call)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_analytics(days_back INT DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  start_date TIMESTAMPTZ;
BEGIN
  IF public.get_user_role() != 'admin' THEN
    RETURN json_build_object('error', 'unauthorized');
  END IF;

  start_date := NOW() - (days_back || ' days')::INTERVAL;

  WITH
  view_counts AS (
    SELECT article_id, COUNT(*) AS views
    FROM article_views
    WHERE viewed_at >= start_date
    GROUP BY article_id
  ),
  top_articles AS (
    SELECT a.id AS article_id, a.title, a.slug, COALESCE(vc.views, 0)::INT AS views
    FROM articles a
    LEFT JOIN view_counts vc ON vc.article_id = a.id
    WHERE a.status = 'published'
    ORDER BY COALESCE(vc.views, 0) DESC
    LIMIT 10
  ),
  by_category AS (
    SELECT c.id AS category_id, c.name AS category_name, c.slug AS category_slug, COALESCE(SUM(vc.views), 0)::BIGINT AS views
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published'
    LEFT JOIN view_counts vc ON vc.article_id = a.id
    GROUP BY c.id, c.name, c.slug
    ORDER BY views DESC
  ),
  by_day AS (
    SELECT DATE(viewed_at) AS day, COUNT(*)::BIGINT AS views
    FROM article_views
    WHERE viewed_at >= start_date
    GROUP BY DATE(viewed_at)
    ORDER BY day
  ),
  total AS (
    SELECT COUNT(*)::BIGINT AS total_views FROM article_views WHERE viewed_at >= start_date
  )
  SELECT json_build_object(
    'total_views', (SELECT total_views FROM total),
    'top_articles', (SELECT COALESCE(json_agg(row_to_json(ta)), '[]'::json) FROM top_articles ta),
    'by_category', (SELECT COALESCE(json_agg(row_to_json(bc)), '[]'::json) FROM by_category bc),
    'by_day', (SELECT COALESCE(json_agg(row_to_json(bd)), '[]'::json) FROM by_day bd)
  ) INTO result;

  RETURN result;
END;
$$;
