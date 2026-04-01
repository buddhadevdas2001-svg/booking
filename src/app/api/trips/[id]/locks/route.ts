import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ActiveLockRow = {
    seat_label: string
    session_id: string
}

type ConfirmedBookingRow = {
    id: string
}

type BookedSeatRow = {
    seat_label: string
}

async function getOptionalUserId(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.slice('Bearer '.length)
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.getUser(token)
    if (error) return null
    return data.user?.id || null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: tripId } = await params
        const { seatLabels, sessionId, durationMinutes = 5 } = await req.json()

        if (!tripId || !Array.isArray(seatLabels) || seatLabels.length === 0 || !sessionId) {
            return NextResponse.json({ message: 'Trip, seats, and session are required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const userId = await getOptionalUserId(req)
        const nowIso = new Date().toISOString()
        const expiresAt = new Date(Date.now() + Number(durationMinutes) * 60 * 1000).toISOString()

        await supabase
            .from('seat_locks')
            .delete()
            .eq('trip_id', tripId)
            .in('seat_label', seatLabels)
            .lt('expires_at', nowIso)

        const { data: confirmedBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id')
            .eq('trip_id', tripId)
            .eq('status', 'confirmed')

        if (bookingsError) {
            return NextResponse.json({ message: bookingsError.message }, { status: 500 })
        }

        const bookingIds = ((confirmedBookings || []) as ConfirmedBookingRow[]).map((booking) => booking.id)
        let bookedSeatRows: BookedSeatRow[] = []

        if (bookingIds.length > 0) {
            const { data: bookedSeats, error: bookedSeatsError } = await supabase
                .from('booking_seats')
                .select('seat_label')
                .in('booking_id', bookingIds)
                .in('seat_label', seatLabels)

            if (bookedSeatsError) {
                return NextResponse.json({ message: bookedSeatsError.message }, { status: 500 })
            }

            bookedSeatRows = (bookedSeats || []) as BookedSeatRow[]
        }

        const bookedSeatSet = new Set(bookedSeatRows.map((seat) => seat.seat_label))

        const { data: activeLocks, error: locksError } = await supabase
            .from('seat_locks')
            .select('seat_label, session_id')
            .eq('trip_id', tripId)
            .in('seat_label', seatLabels)
            .gt('expires_at', nowIso)

        if (locksError) {
            return NextResponse.json({ message: locksError.message }, { status: 500 })
        }

        const activeLockMap = new Map(
            ((activeLocks || []) as ActiveLockRow[]).map((lock) => [lock.seat_label, lock.session_id])
        )

        const lockedSeats: string[] = []
        const failedSeats: string[] = []

        for (const seatLabel of seatLabels) {
            if (bookedSeatSet.has(seatLabel)) {
                failedSeats.push(seatLabel)
                continue
            }

            const currentSession = activeLockMap.get(seatLabel)
            if (currentSession && currentSession !== sessionId) {
                failedSeats.push(seatLabel)
                continue
            }

            if (currentSession === sessionId) {
                const { error } = await supabase
                    .from('seat_locks')
                    .update({
                        expires_at: expiresAt,
                        user_id: userId,
                    } as never)
                    .eq('trip_id', tripId)
                    .eq('seat_label', seatLabel)
                    .eq('session_id', sessionId)

                if (error) {
                    failedSeats.push(seatLabel)
                } else {
                    lockedSeats.push(seatLabel)
                }
                continue
            }

            const { error } = await supabase.from('seat_locks').insert({
                trip_id: tripId,
                seat_label: seatLabel,
                user_id: userId,
                session_id: sessionId,
                expires_at: expiresAt,
            } as never)

            if (error) {
                failedSeats.push(seatLabel)
            } else {
                lockedSeats.push(seatLabel)
            }
        }

        return NextResponse.json({
            locked_seats: lockedSeats,
            failed_seats: failedSeats,
        })
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to lock seats' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: tripId } = await params
        const { seatLabel, sessionId } = await req.json()

        if (!tripId || !seatLabel || !sessionId) {
            return NextResponse.json({ message: 'Trip, seat, and session are required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase
            .from('seat_locks')
            .delete()
            .eq('trip_id', tripId)
            .eq('seat_label', seatLabel)
            .eq('session_id', sessionId)

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 })
        }

        return NextResponse.json({ released: true })
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to unlock seat' },
            { status: 500 }
        )
    }
}
