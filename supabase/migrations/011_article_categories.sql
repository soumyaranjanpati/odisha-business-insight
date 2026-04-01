-- ============================================================
-- MIGRATION 011: Support multiple categories per article
-- ============================================================

CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (article_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_article_categories_article
  ON public.article_categories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_category
  ON public.article_categories(category_id);

ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "article_categories_select_all" ON public.article_categories FOR SELECT
  USING (true);
CREATE POLICY "article_categories_all_editor" ON public.article_categories FOR ALL
  USING (public.is_editor_or_admin());
