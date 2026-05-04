import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile, UserRole } from '@/types/supabase'

const ADMIN_ROLES = new Set<UserRole>(['admin', 'agent'])
const PERMANENT_ADMINS = new Set(['test123@gmail.com', 'buddhadevdas2001@gmail.com'])

type AdminAccessResult =
  | {
      ok: true
      profile: Profile
    }
  | {
      ok: false
      response: NextResponse
    }

export async function requireAdminRequest(): Promise<AdminAccessResult> {
  // 1. Authenticate the user session using cookies
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Authentication required' }, { status: 401 }),
    }
  }

  // 2. Fetch the profile using the ADMIN client to bypass RLS.
  // This prevents 403s if RLS policies on the 'profiles' table are missing or restrictive.
  let profile: any = null
  let profileError: any = null

  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url, created_at')
      .eq('id', user.id)
      .single()
    profile = data
    profileError = error
  } catch (err) {
    // Fallback if service role is missing
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url, created_at')
      .eq('id', user.id)
      .single()
    profile = data
    profileError = error
  }

  const resolvedProfile: Profile = profile
    ? { ...(profile as Profile), email: user.email }
    : {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'User',
        role: 'customer',
      }

  const role = (resolvedProfile.role || 'customer') as UserRole
  const isPermanentAdmin = user.email && PERMANENT_ADMINS.has(user.email)
  
  // Only enforce in production to allow local development flexibility
  const isProd = process.env.NODE_ENV === 'production'
  
  if (isProd && !isPermanentAdmin && (profileError || !profile || !ADMIN_ROLES.has(role))) {
    console.error('Admin Check Failed:', { profileError, role, userId: user.id })
    return {
      ok: false,
      response: NextResponse.json({ 
        message: 'Admin access required',
        debug: isProd ? undefined : { role, error: profileError?.message }
      }, { status: 403 }),
    }
  }

  return {
    ok: true,
    profile: resolvedProfile,
  }
}
