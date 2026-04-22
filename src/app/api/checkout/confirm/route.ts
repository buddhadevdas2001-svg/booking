import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingStatus, PaymentStatus } from '@/types/supabase'

// Prevent Next.js static generation from crashing at build-time if env var is missing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_to_bypass_build', {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
})

type ConfirmableBooking = {
    id: string
    booking_reference: string
    status: BookingStatus
    payment_status: PaymentStatus
    final_amount: number
    stripe_session_id?: string | null
    stripe_payment_intent_id?: string | null
}

export async function POST(req: NextRequest) {
    try {
        const { bookingId, sessionId } = await req.json()

        if (!bookingId || !sessionId) {
            return NextResponse.json({ message: 'Booking ID and session ID are required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('id, booking_reference, status, payment_status, final_amount, stripe_session_id, stripe_payment_intent_id, trip_id')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
        }

        const bookingData = booking as ConfirmableBooking & { trip_id: string }
        if (bookingData.stripe_session_id && bookingData.stripe_session_id !== sessionId) {
            return NextResponse.json({ message: 'Checkout session does not match booking' }, { status: 400 })
        }

        console.log(`Confirming booking: ${bookingId} with session: ${sessionId}`)
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        })
        console.log('Stripe session retrieved:', session.id, 'status:', session.status, 'payment:', session.payment_status)

        if (session.metadata?.bookingId !== bookingId) {
            return NextResponse.json({ message: 'Checkout session metadata mismatch' }, { status: 400 })
        }

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                {
                    message: 'Payment is not completed yet',
                    payment_status: session.payment_status,
                    session_status: session.status,
                },
                { status: 409 }
            )
        }

        const paymentIntentId =
            typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || bookingData.stripe_payment_intent_id || null

        const updatedAt = new Date().toISOString()
        const bookingUpdate = {
            status: 'confirmed' as BookingStatus,
            payment_status: 'succeeded' as PaymentStatus,
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            updated_at: updatedAt,
        }

        // Perform updates in parallel
        const [updateBookingRes, updateSeatsRes] = await Promise.all([
            supabase
                .from('bookings')
                .update(bookingUpdate as never)
                .eq('id', bookingId),
            // Decrement available seats - simplified since we currently assume 1 seat per booking 
            // In a more complex system, we'd fetch the count from booking_seats
            supabase.rpc('decrement_available_seats', { 
                p_trip_id: bookingData.trip_id,
                p_count: 1 
            })
        ])

        if (updateBookingRes.error) {
            return NextResponse.json({ message: updateBookingRes.error.message }, { status: 500 })
        }

        // Note: RPC might fail if not defined, fallback to direct update if needed
        if (updateSeatsRes.error) {
            console.warn('RPC decrement failed, attempting direct update:', updateSeatsRes.error.message)
            const { data: trip } = await supabase.from('trips').select('available_seats').eq('id', bookingData.trip_id).single()
            if (trip) {
                await supabase.from('trips').update({ 
                    available_seats: Math.max(0, (trip.available_seats || 0) - 1) 
                } as never).eq('id', bookingData.trip_id)
            }
        }

        const paymentPayload = {
            booking_id: bookingId,
            transaction_id: paymentIntentId || session.id,
            gateway: 'stripe',
            amount: Number((session.amount_total ?? Math.round(Number(bookingData.final_amount) * 100)) / 100),
            currency: (session.currency || 'inr').toLowerCase(),
            status: 'succeeded',
            gateway_response: {
                checkout_session_id: session.id,
                payment_status: session.payment_status,
                session_status: session.status,
                payment_intent_id: paymentIntentId,
            },
        }

        const { error: paymentError } = await supabase
            .from('payments')
            .upsert(paymentPayload as never, { 
                onConflict: 'booking_id',
                ignoreDuplicates: false 
            })

        if (paymentError) {
            console.warn('Payment record upsert warning:', paymentError.message)
        }

        return NextResponse.json({
            confirmed: true,
            bookingId,
            paymentStatus: 'succeeded',
        })
    } catch (err) {
        console.error('Checkout confirmation error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to confirm payment' },
            { status: 500 }
        )
    }
}
