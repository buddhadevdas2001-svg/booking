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
        let query = supabase
            .from('trips')
            .select(`
                *,
                route:routes(*),
                bus:buses(*)
            `)
            .neq('status', 'cancelled')
            .order('departure_time', { ascending: true })

        if (date) {
            query = query.gte('departure_time', `${date}T00:00:00`).lte('departure_time', `${date}T23:59:59`)
        }

        const { data, error } = await query
        if (error) throw error

        const trips = (data || []) as SearchTrip[]
        const filtered = trips.filter((trip) => {
            const origin = trip.route?.origin?.toLowerCase() || ''
            const destination = trip.route?.destination?.toLowerCase() || ''

            const fromMatch = !from || origin.includes(from) || from.includes(origin)
            const toMatch = !to || destination.includes(to) || to.includes(destination)

            return fromMatch && toMatch
        })

        return NextResponse.json(filtered)
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to search trips' },
            { status: 500 }
        )
    }
}
