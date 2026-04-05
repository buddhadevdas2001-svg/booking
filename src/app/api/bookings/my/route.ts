import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        // Authenticate user
        const userSupabase = await createServerClient()
        const { data: { user }, error: authError } = await userSupabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const statusFilter = searchParams.get('status') || 'all'

        // Use admin client to bypass RLS on routes/buses join
        const supabase = createAdminClient()

        let query = supabase
            .from('bookings')
            .select(`
                *,
                trip:trips(
                    *,
                    route:routes(*),
                    bus:buses(*)
                ),
                booking_seats(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (statusFilter === 'confirmed') {
            query = query.eq('status', 'confirmed')
        } else if (statusFilter === 'cancelled') {
            query = query.eq('status', 'cancelled')
        }

        const { data, error } = await query
        if (error) throw error

        return NextResponse.json(data || [])
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch bookings'
        return NextResponse.json({ message }, { status: 500 })
    }
}
