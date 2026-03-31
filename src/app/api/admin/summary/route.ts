import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    const supabase = createAdminClient()

    const [bookingsRes, busesRes, usersRes, bookingsListRes, tripsRes] = await Promise.all([
        supabase.from('bookings').select('id, final_amount, status, created_at').order('created_at', { ascending: false }),
        supabase.from('buses').select('id').eq('is_active', true),
        supabase.from('profiles').select('id'),
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

    if (bookingsRes.error) return NextResponse.json({ message: bookingsRes.error.message }, { status: 500 })
    if (busesRes.error) return NextResponse.json({ message: busesRes.error.message }, { status: 500 })
    if (usersRes.error) return NextResponse.json({ message: usersRes.error.message }, { status: 500 })
    if (bookingsListRes.error) return NextResponse.json({ message: bookingsListRes.error.message }, { status: 500 })
    if (tripsRes.error) return NextResponse.json({ message: tripsRes.error.message }, { status: 500 })

    const bookings = (bookingsRes.data || []) as any[]
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.final_amount || 0), 0)
    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length

    const stats = {
        totalBookings,
        totalRevenue,
        activeBuses: busesRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        confirmationRate: totalBookings ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
    }

    return NextResponse.json({
        stats,
        recentBookings: bookingsListRes.data || [],
        upcomingTrips: tripsRes.data || [],
    })
}
