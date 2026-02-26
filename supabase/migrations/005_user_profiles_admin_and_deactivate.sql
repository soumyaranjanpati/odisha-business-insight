-- Admin can update user_profiles (role_id, is_active). Deactivate = set is_active false.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE POLICY "user_profiles_update_admin" ON public.user_profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (true);
