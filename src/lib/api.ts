import type {
    AdminUpcomingTrip,
    Booking,
    BookingSeat,
    Bus,
    Profile,
    Route,
    SearchTrip,
    SeatLayout,
    Staff,
    Trip,
    Coupon,
    AvailableSeatRow,
} from '@/types/supabase'
import { createClient } from '@/lib/supabase/client'

export async function getCurrentProfile() {
    const supabase = createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) return null

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    
    if (error || !profile) {
        return {
            id: user.id,
            email: user.email,
            full_name: user.email?.split('@')[0] || 'User',
            role: 'customer' as Profile['role'],
        }
    }

    return {
        ...(profile as Profile),
        email: user.email,
    }
}

export async function searchTrips(params: { from?: string; to?: string; date?: string }) {
    const { from, to, date } = params
    const url = new URL('/api/trips', window.location.origin)
    if (from) url.searchParams.set('from', from)
    if (to) url.searchParams.set('to', to)
    if (date) url.searchParams.set('date', date)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Failed to search trips')
    return (await res.json()) as SearchTrip[]
}

export async function getTripById(id: string) {
    const res = await fetch(`/api/trips/${id}`)
    if (!res.ok) throw new Error('Failed to fetch trip details')
    return (await res.json()) as SearchTrip
}

export async function getAvailableSeats(tripId: string) {
    const res = await fetch(`/api/trips/${tripId}/seats`)
    if (!res.ok) throw new Error('Failed to fetch available seats')
    return (await res.json()) as AvailableSeatRow[]
}

export async function createPendingBooking(input: {
    userId: string
    tripId: string
    totalAmount: number
    finalAmount: number
    passengerDetails: Booking['passenger_details']
    contactEmail: string
    contactPhone: string
    bookingSeats: Array<Pick<BookingSeat, 'seat_label' | 'passenger_name' | 'passenger_age' | 'price'>>
}): Promise<Booking> {
    const supabase = createClient()

    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
            user_id: input.userId,
            trip_id: input.tripId,
            total_amount: input.totalAmount,
            final_amount: input.finalAmount,
            passenger_details: input.passengerDetails,
            contact_email: input.contactEmail,
            contact_phone: input.contactPhone,
            status: 'pending',
            payment_status: 'pending',
        } as never)
        .select()
        .single()

    if (bookingError) throw bookingError
    const createdBooking = booking as unknown as Booking

    const { error: seatError } = await supabase.from('booking_seats').insert(
        input.bookingSeats.map((seat) => ({
            booking_id: createdBooking.id,
            seat_label: seat.seat_label,
            passenger_name: seat.passenger_name,
            passenger_age: seat.passenger_age,
            price: seat.price,
            status: 'confirmed',
        })) as never
    )

    if (seatError) throw seatError

    return createdBooking
}

export async function lockSeats(input: {
    tripId: string
    seatLabels: string[]
    sessionId: string
    durationMinutes?: number
}): Promise<{ locked_seats: string[]; failed_seats: string[] }> {
    const res = await fetch(`/api/trips/${input.tripId}/locks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            seatLabels: input.seatLabels,
            sessionId: input.sessionId,
            durationMinutes: input.durationMinutes ?? 5,
        }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to lock seats')
    return (data as { locked_seats: string[]; failed_seats: string[] }) || { locked_seats: [], failed_seats: [] }
}
export async function unlockSeat(tripId: string, seatLabel: string, sessionId: string) {
    const res = await fetch(`/api/trips/${tripId}/locks`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatLabel, sessionId }),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Failed to unlock seat')
    }
}

export async function getMyBookings(statusFilter?: string) {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

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
    } else if (statusFilter === 'upcoming') {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        query = query.eq('status', 'confirmed').gte('trip.departure_time', tomorrow.toISOString())
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as Booking[]
}


export async function getAdminBuses() {
    const res = await fetch('/api/admin/buses')
    if (!res.ok) throw new Error('Failed to fetch buses')
    return (await res.json()) as Bus[]
}

export async function getAdminRoutes() {
    const res = await fetch('/api/admin/routes')
    if (!res.ok) throw new Error('Failed to fetch routes')
    return (await res.json()) as Route[]
}

export async function getAdminTrips() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('trips')
        .select(`
            *,
            route:routes(*),
            bus:buses(*)
        `)
        .order('departure_time', { ascending: true })
    if (error) throw error
    return (data || []) as AdminUpcomingTrip[]
}

export async function getSeatLayouts() {
    const supabase = createClient()
    const { data, error } = await supabase.from('seat_layouts').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as SeatLayout[]
}

export async function getStaff() {
    const supabase = createClient()
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Staff[]
}

export async function getCities() {
    const res = await fetch('/api/cities')
    if (!res.ok) throw new Error('Failed to fetch cities')
    return (await res.json()) as string[]
}

export async function getPopularRoutes() {
    const res = await fetch('/api/popular-routes')
    if (!res.ok) throw new Error('Failed to fetch popular routes')
    return (await res.json()) as Route[]
}

export async function getOffers() {
    const res = await fetch('/api/offers')
    if (!res.ok) throw new Error('Failed to fetch offers')
    return (await res.json()) as Coupon[]
}

export const busAPI = {
    getAll: () => createClient().from('buses').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => createClient().from('buses').select('*').eq('id', id).single(),
    create: (data: Partial<Bus>) => createClient().from('buses').insert(data as never),
    update: (id: string, data: Partial<Bus>) => createClient().from('buses').update(data as never).eq('id', id),
    delete: (id: string) => createClient().from('buses').delete().eq('id', id),
}

export const routeAPI = {
    getAll: () => createClient().from('routes').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => createClient().from('routes').select('*').eq('id', id).single(),
    create: (data: Partial<Route>) => createClient().from('routes').insert(data as never),
    update: (id: string, data: Partial<Route>) => createClient().from('routes').update(data as never).eq('id', id),
    delete: (id: string) => createClient().from('routes').delete().eq('id', id),
}

export const tripAPI = {
    getAll: () =>
        createClient()
            .from('trips')
            .select(`
                *,
                route:routes(*),
                bus:buses(*),
                seat_layout:seat_layouts(*)
            `)
            .order('departure_time', { ascending: true }),
    getById: (id: string) =>
        createClient()
            .from('trips')
            .select(`
                *,
                route:routes(*),
                bus:buses(*),
                seat_layout:seat_layouts(*)
            `)
            .eq('id', id)
            .single(),
    search: ({ origin, destination, date }: { origin?: string; destination?: string; date?: string }) =>
        searchTrips({ from: origin, to: destination, date }),
    create: (data: Partial<Trip>) => createClient().from('trips').insert(data as never),
    update: (id: string, data: Partial<Trip>) => createClient().from('trips').update(data as never).eq('id', id),
    delete: (id: string) => createClient().from('trips').delete().eq('id', id),
}
