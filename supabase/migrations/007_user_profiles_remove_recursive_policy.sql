-- Remove policy that causes infinite recursion when admin updates user_profiles.
-- (is_admin() reads user_profiles -> triggers RLS -> is_admin() again.)
-- Admin updates are done via service role in the app, so this policy is not needed.
DROP POLICY IF EXISTS "user_profiles_update_admin" ON public.user_profiles;
