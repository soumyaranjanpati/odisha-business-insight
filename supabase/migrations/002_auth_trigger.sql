-- Create user_profile when a new auth user signs up.
-- Default role: subscriber. Change to editor/admin via dashboard or admin UI.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'subscriber' LIMIT 1;
  INSERT INTO public.user_profiles (id, role_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(default_role_id, (SELECT id FROM public.roles WHERE name = 'public' LIMIT 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users: must be created via SQL Editor (Dashboard Triggers UI
-- cannot create triggers on the protected auth schema).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
