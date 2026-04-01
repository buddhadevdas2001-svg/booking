import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useBookingStore } from '@/store'

type SeatLockRow = {
  seat_label: string
}

type BookingRow = {
  id: string
}

type BookedSeatRow = {
  seat_label: string
}

export function useRealtimeSeats(tripId: string) {
  const { setLockedSeats } = useBookingStore()

  useEffect(() => {
    // Subscribe to seat locks
    const locksSubscription = createClient()
      .channel(`seat-locks-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_locks',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload: RealtimePostgresChangesPayload<SeatLockRow>) => {
          if (payload.eventType === 'INSERT') {
            setLockedSeats((prev: string[]) => [...prev, payload.new.seat_label])
          } else if (payload.eventType === 'DELETE') {
            setLockedSeats((prev: string[]) => prev.filter(s => s !== payload.old.seat_label))
          }
        }
      )
      .subscribe()

    // Subscribe to booking confirmations
    const bookingsSubscription = createClient()
      .channel(`bookings-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `trip_id=eq.${tripId}`,
        },
        async (payload: RealtimePostgresChangesPayload<BookingRow>) => {
          const bookingId = typeof payload.new === 'object' && payload.new && 'id' in payload.new
            ? String(payload.new.id)
            : null
          if (!bookingId) return

          // Fetch the booked seats for this booking and remove them from locked seats
          const { data: seats } = await createClient()
            .from('booking_seats')
            .select('seat_label')
            .eq('booking_id', bookingId)

          const bookedSeats = (seats || []) as BookedSeatRow[]
          if (bookedSeats.length > 0) {
            setLockedSeats((prev: string[]) => prev.filter(seat => !bookedSeats.some((booked) => booked.seat_label === seat)))
          }
        }
      )
      .subscribe()

    return () => {
      locksSubscription.unsubscribe()
      bookingsSubscription.unsubscribe()
    }
  }, [tripId, setLockedSeats])
}
