import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/elevate-me
 * Elevates the currently logged-in user's profile role to 'admin'.
 * Uses the admin client to bypass RLS policies for this utility.
 */
export async function GET() {
    try {
        // 1. Verify user session using the standard server client
        const userClient = await createServerClient()
        const { data: { user }, error: authError } = await userClient.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // 2. Perform elevation using the admin client (bypasses RLS)
        const adminClient = createAdminClient()
        
        console.log('Attempting elevation for user:', user.email)
        console.log('User ID:', user.id)

        const { data, error } = await adminClient
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
                role: 'admin',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .select()
            .single()

        if (error) {
            console.error('Elevate error details:', JSON.stringify(error, null, 2))
            return NextResponse.json({ 
                error: error.message,
                details: error,
                hint: 'If you see an RLS error, the profiles table may not exist yet or the service role key is not bypassing RLS.',
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
