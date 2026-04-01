-- =====================================================
-- GRANT GLOBAL ADMIN ACCESS (DEVELOPMENT SAFETY NET)
-- =====================================================


-- 1. Function to promote any user to Admin via email
CREATE OR REPLACE FUNCTION public.make_admin_by_email(p_email TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update Profiles table
    UPDATE public.profiles
    SET role = 'admin'::user_role
    WHERE id IN (SELECT id FROM auth.users WHERE email = p_email);

    -- Also update user metadata in auth.users for synchronization
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::JSONB) || 
        JSONB_BUILD_OBJECT('role', 'admin')
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Automatically promote all existing users to admin for development
-- CAUTION: Remove this before production deployment or 
-- manually call SELECT public.make_admin_by_email('your-email@example.com');
UPDATE public.profiles SET role = 'admin'::user_role;

-- 3. Also promote auth.users metadata for dev-sync
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::JSONB) || JSONB_BUILD_OBJECT('role', 'admin');
