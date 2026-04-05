import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SearchTrip } from '@/types/supabase'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const from = searchParams.get('from')?.toLowerCase()
        const to = searchParams.get('to')?.toLowerCase()
        const date = searchParams.get('date')

        const supabase = createAdminClient()
        const nowUtc = new Date().toISOString()
        let query = supabase
            .from('trips')
            .select(`
                *,
                route:routes!inner(*),
                bus:buses(*)
            `)
            .neq('status', 'cancelled')
            .gt('departure_time', nowUtc)  // Only show trips that haven't departed yet
            .order('departure_time', { ascending: true })

        if (date) {
            query = query.gte('departure_time', `${date}T00:00:00`).lte('departure_time', `${date}T23:59:59`)
        }

        if (from) {
            query = query.ilike('route.origin', `%${from}%`)
        }

        if (to) {
            query = query.ilike('route.destination', `%${to}%`)
        }

        const { data, error } = await query
        if (error) throw error

        return NextResponse.json(data || [])
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to search trips' },
            { status: 500 }
        )
    }
}
