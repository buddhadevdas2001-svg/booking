import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore } from '@/store'

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
        (payload) => {
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
        async (payload) => {
          // Fetch the booked seats for this booking and remove them from locked seats
          const { data: seats } = await createClient()
            .from('booking_seats')
            .select('seat_label')
            .eq('booking_id', payload.new.id)

          if (seats && seats.length > 0) {
            setLockedSeats((prev: string[]) => prev.filter(seat => !seats.some((booked: any) => booked.seat_label === seat)))
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
