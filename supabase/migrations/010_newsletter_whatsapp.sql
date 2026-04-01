-- ============================================================
-- MIGRATION 010: Add WhatsApp number to newsletter_subscribers
-- ============================================================

-- 1. Drop the NOT NULL constraint on email so WhatsApp-only subscribers are allowed
ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN email DROP NOT NULL;

-- 2. Drop the old unique index on email (we'll recreate it as a proper unique constraint
--    so partial-index upsert works cleanly; NULLs are not equal in UNIQUE constraints
--    so multiple NULL-email rows are fine)
DROP INDEX IF EXISTS idx_newsletter_email;

-- 3. Add a unique constraint on email (partial: only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_unique
  ON public.newsletter_subscribers (email)
  WHERE email IS NOT NULL;

-- 4. Add whatsapp_number column
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 5. Unique constraint on whatsapp_number (partial: only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_whatsapp_unique
  ON public.newsletter_subscribers (whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;

-- 6. Enforce that at least one contact method must be provided
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_contact_check
  CHECK (email IS NOT NULL OR whatsapp_number IS NOT NULL);

-- ============================================================
-- No RLS changes needed – existing policies cover the table.
-- Admin export query uses service role which bypasses RLS.
-- ============================================================
