import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { requireAdminRequest } from '@/lib/admin-auth'

type BookingRow = { 
    final_amount: number | null; 
    created_at: string; 
    trip?: { 
        route?: { origin?: string; destination?: string };
        bus?: { bus_type?: string }
    } 
}
type TripRow = { 
    route?: { origin?: string; destination?: string }; 
    bus?: { bus_type?: string }; 
    available_seats?: number | null; 
    total_seats?: number | null 
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
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const [bookingsRes, tripsRes] = await Promise.all([
        supabase
            .from('bookings')
            .select('final_amount, created_at, trip:trips(route:routes(origin,destination), bus:buses(bus_type))')
            .gte('created_at', since.toISOString()),
        supabase
            .from('trips')
            .select('available_seats, total_seats, route:routes(origin,destination), bus:buses(bus_type)')
            .order('departure_time', { ascending: false })
            .limit(200),
    ])

    if (bookingsRes.error) return NextResponse.json({ message: bookingsRes.error.message }, { status: 500 })
    if (tripsRes.error) return NextResponse.json({ message: tripsRes.error.message }, { status: 500 })

    const bookings = (bookingsRes.data || []) as BookingRow[]
    const trips = (tripsRes.data || []) as TripRow[]

    // Revenue by day (last 30)
    const revenueByDay = new Map<string, number>()
    bookings.forEach((b) => {
        const day = b.created_at.slice(0, 10)
        revenueByDay.set(day, (revenueByDay.get(day) || 0) + Number(b.final_amount || 0))
    })

    const revenueSeries = Array.from(revenueByDay.entries())
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([day, value]) => ({ name: day, revenue: value }))

    // Route popularity
    const routeCounts = new Map<string, number>()
    bookings.forEach((b) => {
        const key = `${b.trip?.route?.origin || 'N/A'} → ${b.trip?.route?.destination || 'N/A'}`
        routeCounts.set(key, (routeCounts.get(key) || 0) + 1)
    })
    const popularRoutes = Array.from(routeCounts.entries())
        .map(([name, bookings]) => ({ name, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 6)

    // Bus type mix (based on bookings)
    const busTypeCounts = new Map<string, number>()
    bookings.forEach((b) => {
        const key = b.trip?.bus?.bus_type || 'Unknown'
        busTypeCounts.set(key, (busTypeCounts.get(key) || 0) + 1)
    })
    
    const totalAnalyticsBookings = bookings.length
    const busTypes = Array.from(busTypeCounts.entries()).map(([name, count]) => ({ 
        name, 
        value: totalAnalyticsBookings ? Math.round((count / totalAnalyticsBookings) * 100) : 0 
    }))

    // Occupancy approximation
    const occupancy = trips
        .filter((t) => t.total_seats)
        .map((t) => {
            const total = Number(t.total_seats || 0)
            const available = Number(t.available_seats || total)
            const filled = Math.max(total - available, 0)
            return { utilization: total ? Math.round((filled / total) * 100) : 0 }
        })
    const avgOccupancy = occupancy.length
        ? Math.round(occupancy.reduce((sum, o) => sum + o.utilization, 0) / occupancy.length)
        : 0

    return NextResponse.json({
        revenueSeries,
        popularRoutes,
        busTypes,
        avgOccupancy,
    })
}
