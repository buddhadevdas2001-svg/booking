import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { requireAdminRequest } from '@/lib/admin-auth'

type BookingMetricRow = {
    final_amount: number | null
    status: string | null
}

// Safe DB client: uses admin client (bypasses RLS) if service role key is set, 
// otherwise falls back to server client (uses RLS with current user session).
async function getDbClient() {
    try {
        return createAdminClient()
    } catch {
        return createServerClient()
    }
}

export async function GET() {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const supabase = await getDbClient()

    const [bookingsCountRes, confirmedBookingsRes, busesCountRes, usersCountRes, bookingsListRes, tripsRes] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('final_amount').eq('status', 'confirmed'),
        supabase.from('buses').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
            .from('bookings')
            .select('id, booking_reference, final_amount, status, created_at, trip:trips(route:routes(origin,destination), bus:buses(name))')
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('trips')
            .select('id, departure_time, arrival_time, status, route:routes(origin,destination), bus:buses(name, total_seats), available_seats')
            .gte('departure_time', new Date().toISOString())
            .order('departure_time', { ascending: true })
            .limit(5),
    ])

    if (bookingsCountRes.error) return NextResponse.json({ message: bookingsCountRes.error.message }, { status: 500 })
    if (confirmedBookingsRes.error) return NextResponse.json({ message: confirmedBookingsRes.error.message }, { status: 500 })
    if (busesCountRes.error) return NextResponse.json({ message: busesCountRes.error.message }, { status: 500 })
    if (usersCountRes.error) return NextResponse.json({ message: usersCountRes.error.message }, { status: 500 })
    if (bookingsListRes.error) return NextResponse.json({ message: bookingsListRes.error.message }, { status: 500 })
    if (tripsRes.error) return NextResponse.json({ message: tripsRes.error.message }, { status: 500 })

    const totalBookings = bookingsCountRes.count || 0
    const confirmedBookings = confirmedBookingsRes.data || []
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.final_amount || 0), 0)
    const confirmedCount = confirmedBookings.length

    const stats = {
        totalBookings,
        totalRevenue,
        activeBuses: busesCountRes.count || 0,
        totalUsers: usersCountRes.count || 0,
        confirmationRate: totalBookings ? Math.round((confirmedCount / totalBookings) * 100) : 0,
    }

    return NextResponse.json({
        stats,
        recentBookings: bookingsListRes.data || [],
        upcomingTrips: tripsRes.data || [],
    })
}
