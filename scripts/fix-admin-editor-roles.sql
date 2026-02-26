-- Fix roles: set admin and editor users to correct role (run in Supabase SQL Editor)
-- Use LOWER(TRIM(email)) so small differences in email don't prevent a match.

-- 1. Set adminodishabusinessnews@gmail.com to admin
UPDATE public.user_profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1),
    updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM('adminodishabusinessnews@gmail.com'))
  LIMIT 1
);

-- 2. Set editerodishabusinessnews@gmail.com to editor
UPDATE public.user_profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'editor' LIMIT 1),
    updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM('editerodishabusinessnews@gmail.com'))
  LIMIT 1
);

-- 3. Verify (should show admin and editor)
SELECT u.email, r.name AS role
FROM auth.users u
JOIN public.user_profiles up ON up.id = u.id
JOIN public.roles r ON r.id = up.role_id
WHERE LOWER(u.email) IN (
  LOWER('adminodishabusinessnews@gmail.com'),
  LOWER('editerodishabusinessnews@gmail.com')
);
