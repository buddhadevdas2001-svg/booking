import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
})

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

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Bus Ticket: ${booking.trip.route.origin} to ${booking.trip.route.destination}`,
                            description: `Seat(s): ${booking.booking_seats.map((s: any) => s.seat_label).join(', ')} | Bus: ${booking.trip.bus.name}`,
                        },
                        unit_amount: Math.round(Number(booking.final_amount) * 100), // Stripe expects amounts in cents/paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${booking.trip_id}`,
            metadata: {
                bookingId: booking.id,
                tripId: booking.trip_id,
                userId: booking.user_id,
            },
        })

        return NextResponse.json({ sessionId: session.id })
    } catch (err) {
        console.error('Stripe session creation error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
