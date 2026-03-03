-- ============================================================
-- ADVERTISEMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  description TEXT,
  advertiser TEXT,
  amount_per_month NUMERIC,
  total_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_advertisements_start_date ON public.advertisements(start_date);
CREATE INDEX IF NOT EXISTS idx_advertisements_end_date ON public.advertisements(end_date);
CREATE INDEX IF NOT EXISTS idx_advertisements_active_dates ON public.advertisements(is_active, start_date, end_date) WHERE is_active = true;

COMMENT ON TABLE public.advertisements IS 'Ad units for sidebar display; managed by editors and admins';

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Public can read active ads in date range (used by SidebarAds)
CREATE POLICY "advertisements_select_active" ON public.advertisements FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= CURRENT_DATE)
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  );

-- Editors and admins can read all ads (for manage page)
CREATE POLICY "advertisements_select_editor_admin" ON public.advertisements FOR SELECT
  USING (public.is_editor_or_admin());

-- Editors and admins can insert
CREATE POLICY "advertisements_insert_editor_admin" ON public.advertisements FOR INSERT
  WITH CHECK (public.is_editor_or_admin());

-- Editors and admins can update
CREATE POLICY "advertisements_update_editor_admin" ON public.advertisements FOR UPDATE
  USING (public.is_editor_or_admin());

-- Only admins can delete
CREATE POLICY "advertisements_delete_admin" ON public.advertisements FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKET: advertisement-images
-- Public read for displaying ads. Create via dashboard if this fails.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('advertisement-images', 'advertisement-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: public read; authenticated insert/update/delete (editor/admin via app)
DROP POLICY IF EXISTS "advertisement_images_public_read" ON storage.objects;
CREATE POLICY "advertisement_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'advertisement-images');

DROP POLICY IF EXISTS "advertisement_images_authenticated_insert" ON storage.objects;
CREATE POLICY "advertisement_images_authenticated_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'advertisement-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "advertisement_images_authenticated_update" ON storage.objects;
CREATE POLICY "advertisement_images_authenticated_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'advertisement-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "advertisement_images_authenticated_delete" ON storage.objects;
CREATE POLICY "advertisement_images_authenticated_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'advertisement-images' AND auth.role() = 'authenticated');
