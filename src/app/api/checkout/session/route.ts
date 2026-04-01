import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingSeat } from '@/types/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
})

type CheckoutBooking = {
    id: string
    trip_id: string
    user_id: string
    final_amount: number
    trip: {
        route: {
            origin: string
            destination: string
        }
        bus: {
            name: string
        }
    }
    booking_seats: Pick<BookingSeat, 'seat_label'>[]
}

export async function POST(req: NextRequest) {
    try {
        const { bookingId } = await req.json()

        if (!bookingId) {
            return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        
        // Fetch booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                trip:trips(
                    route:routes(origin, destination),
                    bus:buses(name)
                ),
                booking_seats(*)
            `)
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            console.error('Booking fetch error:', bookingError)
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
        }

        const bookingData = booking as CheckoutBooking

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Bus Ticket: ${bookingData.trip.route.origin} to ${bookingData.trip.route.destination}`,
                            description: `Seat(s): ${bookingData.booking_seats.map((seat) => seat.seat_label).join(', ')} | Bus: ${bookingData.trip.bus.name}`,
                        },
                        unit_amount: Math.round(Number(bookingData.final_amount) * 100), // Stripe expects amounts in cents/paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${bookingData.trip_id}`,
            metadata: {
                bookingId: bookingData.id,
                tripId: bookingData.trip_id,
                userId: bookingData.user_id,
            },
        })

        await supabase
            .from('bookings')
            .update({
                stripe_session_id: session.id,
                updated_at: new Date().toISOString(),
            } as never)
            .eq('id', bookingId)

        return NextResponse.json({ sessionId: session.id })
    } catch (err) {
        console.error('Stripe session creation error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
