-- ============================================================
-- MIGRATION 012: article-images storage bucket + policies
-- (Safe to run if bucket already exists from dashboard.)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "article_images_public_read" ON storage.objects;
CREATE POLICY "article_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "article_images_authenticated_insert" ON storage.objects;
CREATE POLICY "article_images_authenticated_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "article_images_authenticated_update" ON storage.objects;
CREATE POLICY "article_images_authenticated_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "article_images_authenticated_delete" ON storage.objects;
CREATE POLICY "article_images_authenticated_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');
