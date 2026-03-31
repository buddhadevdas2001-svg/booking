import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()
        const supabase = createAdminClient()

        // 1. Authenticate the user securely via admin (or regular) but we need to return the profile
        // Actually for login we want to use the standard auth but the profile part is what usually fails.
        // Let's use a standard client but ensure we return the profile data too.
        
        const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        if (!user) throw new Error('Login failed')

        // 2. Fetch the profile using admin client to bypass RLS
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            // Profile missing? Create a default one
            console.warn('Profile missing for user, creating default', user.id)
            const { data: newProfile } = await supabase
                .from('profiles')
                .insert({ id: user.id, full_name: user.user_metadata?.full_name || 'User', role: 'customer' })
                .select()
                .single()
            return NextResponse.json({ user, profile: newProfile })
        }

        return NextResponse.json({ user, profile })
    } catch (err) {
        console.error('Login API Error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Login failed' },
            { status: 500 }
        )
    }
}
