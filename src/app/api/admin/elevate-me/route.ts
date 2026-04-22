import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/elevate-me
 * Elevates the currently logged-in user's profile role to 'admin'.
 * This uses the server client (cookie-based session) so no service role key is needed.
 * Works because users can update their own profile row (RLS: auth.uid() = id).
 */
export async function GET() {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Upsert profile with admin role
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
                role: 'admin',
            }, { onConflict: 'id' })
            .select()
            .single()

        if (error) {
            console.error('Elevate error:', error)
            return NextResponse.json({ 
                error: error.message,
                hint: 'If you see an RLS error, the profiles table may not exist yet. Run setup_merged.sql first.',
            }, { status: 400 })
        }

        return NextResponse.json({ 
            success: true, 
            message: `User ${user.email} is now an admin!`,
            profile: data
        })
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
