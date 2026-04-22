import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { requireAdminRequest } from '@/lib/admin-auth'

// Safe DB client: uses admin client (bypasses RLS) if service role key is set, 
// otherwise falls back to server client (uses RLS with current user session).
async function getDbClient() {
    try {
        return createAdminClient()
    } catch {
        return createServerClient()
    }
}

export async function GET(req: NextRequest) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const date = searchParams.get('date')

        const supabase = await getDbClient()
        let query = supabase
            .from('payments')
            .select(`
                *,
                booking:bookings (
                    booking_reference,
                    contact_email,
                    user:user_id (
                        full_name
                    )
                )
            `)
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        if (date) {
            query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`)
        }

        const { data, error } = await query
        if (error) throw error

        return NextResponse.json(data || [])
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
