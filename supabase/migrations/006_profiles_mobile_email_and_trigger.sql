-- Add mobile_number and email to user_profiles for admin display
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Update trigger function: use 'public' role, set name, mobile_number, email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  public_role_id UUID;
BEGIN
  SELECT id INTO public_role_id FROM public.roles WHERE name = 'public' LIMIT 1;
  INSERT INTO public.user_profiles (id, role_id, display_name, mobile_number, email)
  VALUES (
    NEW.id,
    COALESCE(public_role_id, (SELECT id FROM public.roles LIMIT 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'mobile_number',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
