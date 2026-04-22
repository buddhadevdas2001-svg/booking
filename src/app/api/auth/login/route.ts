import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()
        // Use server (cookie-based) client for sign-in — does NOT need service role key
        const supabase = await createClient()

        const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        if (!user) throw new Error('Login failed')

        // Try admin client for profile lookup; fall back to server client
        let dbClient = supabase
        try { dbClient = createAdminClient() } catch { /* no service key, use server client */ }
        const { data: profile, error: profileError } = await dbClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.warn('Profile missing for user, creating default', user.id)
            const adminSupabase = await createClient()
            const { data: newProfile } = await adminSupabase
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
