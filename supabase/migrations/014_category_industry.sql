-- Ensure Industry category exists (Google News category hub /category/industry)
INSERT INTO public.categories (name, slug, description, sort_order)
VALUES (
  'Industry',
  'industry',
  'Manufacturing, industrial corridors, and sector developments in Odisha.',
  12
)
ON CONFLICT (slug) DO NOTHING;
