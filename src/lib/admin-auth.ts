import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types/supabase'

const ADMIN_ROLES = new Set<UserRole>(['admin', 'agent'])

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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const resolvedProfile: Profile = profile
    ? { ...(profile as Profile), email: user.email }
    : {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'User',
        role: 'customer',
      }

  const role = (resolvedProfile.role || 'customer') as UserRole
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && (profileError || !profile || !ADMIN_ROLES.has(role))) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Admin access required' }, { status: 403 }),
    }
  }

  return {
    ok: true,
    profile: resolvedProfile,
  }
}
