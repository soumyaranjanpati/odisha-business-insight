-- ============================================================
-- Create Editor and Admin Users for Odisha Business Insight
-- ============================================================
--
-- STEP 1: Create the users in Supabase Dashboard FIRST
--   Email: editerodishabusinessnews@gmail.com  | Password: AdminPassword
--   Email: adminodishabusinessnews@gmail.com  | Password: AdminPassword
--
-- STEP 2: Run the FIX block below in SQL Editor (run all statements).
-- ============================================================

-- ---------- DIAGNOSTIC: run this first to see current state ----------
-- (Shows each user's email and current role. If role is 'public', run the FIX below.)
/*
SELECT u.id, u.email, r.name AS current_role
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.id = u.id
LEFT JOIN public.roles r ON r.id = up.role_id
WHERE LOWER(u.email) IN (
  LOWER('editerodishabusinessnews@gmail.com'),
  LOWER('adminodishabusinessnews@gmail.com')
);
*/

-- ---------- FIX: set admin role (run this block) ----------
-- Step A: Ensure profile row exists and set role to admin for admin user
INSERT INTO public.user_profiles (id, role_id, display_name, email, updated_at)
SELECT u.id, r.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)), u.email, NOW()
FROM auth.users u
CROSS JOIN public.roles r
WHERE LOWER(TRIM(u.email)) = LOWER(TRIM('adminodishabusinessnews@gmail.com'))
  AND r.name = 'admin'
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  updated_at = NOW();

-- Step B: Same for editor user
INSERT INTO public.user_profiles (id, role_id, display_name, email, updated_at)
SELECT u.id, r.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)), u.email, NOW()
FROM auth.users u
CROSS JOIN public.roles r
WHERE LOWER(TRIM(u.email)) = LOWER(TRIM('editerodishabusinessnews@gmail.com'))
  AND r.name = 'editor'
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  updated_at = NOW();

-- ---------- ALTERNATIVE: if profile rows already exist, run ONLY these 2 UPDATEs ----------
-- (Copy and run in SQL Editor if the INSERT block above doesn't change the role.)
-- UPDATE public.user_profiles
-- SET role_id = (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1), updated_at = NOW()
-- WHERE id = (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM('adminodishabusinessnews@gmail.com')) LIMIT 1);
-- UPDATE public.user_profiles
-- SET role_id = (SELECT id FROM public.roles WHERE name = 'editor' LIMIT 1), updated_at = NOW()
-- WHERE id = (SELECT id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM('editerodishabusinessnews@gmail.com')) LIMIT 1);

-- ---------- VERIFY: run after fix ----------
SELECT u.email, r.name AS role
FROM auth.users u
JOIN public.user_profiles up ON up.id = u.id
JOIN public.roles r ON r.id = up.role_id
WHERE LOWER(u.email) IN (
  LOWER('editerodishabusinessnews@gmail.com'),
  LOWER('adminodishabusinessnews@gmail.com')
);
