-- Google News–oriented article fields: byline, source line, Odisha insight block
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS why_this_matters TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS author_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_articles_author_slug ON public.articles(author_slug)
  WHERE author_slug IS NOT NULL;

COMMENT ON COLUMN public.articles.why_this_matters IS 'Odisha-focused impact / why it matters section';
COMMENT ON COLUMN public.articles.source IS 'Attribution line from source URLs or editor';
COMMENT ON COLUMN public.articles.author_name IS 'Display byline name (e.g. Ranjan)';
COMMENT ON COLUMN public.articles.author_slug IS 'URL slug for /author/:slug';
