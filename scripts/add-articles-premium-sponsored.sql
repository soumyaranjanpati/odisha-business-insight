-- Add premium and sponsored columns to articles (from migration 003).
-- Run this in Supabase Dashboard → SQL Editor if you get "Could not find the 'is_premium' column" error.

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsored_by TEXT;

CREATE INDEX IF NOT EXISTS idx_articles_is_premium ON public.articles(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_sponsored ON public.articles(is_sponsored) WHERE is_sponsored = true;

COMMENT ON COLUMN public.articles.is_premium IS 'Gated content; requires active premium subscription to view full body';
COMMENT ON COLUMN public.articles.is_sponsored IS 'Sponsored content; display sponsor label';
COMMENT ON COLUMN public.articles.sponsored_by IS 'Name or brand of sponsor (optional)';
