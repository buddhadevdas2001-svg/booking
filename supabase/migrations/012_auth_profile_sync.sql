-- =====================================================
-- AUTO-SYNC AUTH USERS TO PROFILES (SAFETY NET)
-- =====================================================

-- 1. Ensure the sync function exists
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_profiles()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, created_at)
    SELECT 
        id, 
        COALESCE(raw_user_meta_data ->> 'full_name', email, 'User'), 
        'customer'::user_role,
        created_at
    FROM auth.users
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Execute sync immediately to fix existing "stuck" users
SELECT public.sync_auth_users_to_profiles();

-- 3. Update the handle_new_user trigger with safer logic (Upsert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'User'),
        NEW.raw_user_meta_data ->> 'phone',
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- 4. Ensure the trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FIX FOR ADMIN ACCESS
-- =====================================================
-- Ensure we can always grant admin role via metadata if needed
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.raw_user_meta_data ->> 'role') IS NOT NULL THEN
        UPDATE public.profiles 
        SET role = (NEW.raw_user_meta_data ->> 'role')::user_role 
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role();
