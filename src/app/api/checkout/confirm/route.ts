import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingStatus, PaymentStatus } from '@/types/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
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
            .select('id, booking_reference, status, payment_status, final_amount, stripe_session_id, stripe_payment_intent_id')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
        }

        const bookingData = booking as ConfirmableBooking
        if (bookingData.stripe_session_id && bookingData.stripe_session_id !== sessionId) {
            return NextResponse.json({ message: 'Checkout session does not match booking' }, { status: 400 })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        })

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

        const { error: updateError } = await supabase
            .from('bookings')
            .update(bookingUpdate as never)
            .eq('id', bookingId)

        if (updateError) {
            return NextResponse.json({ message: updateError.message }, { status: 500 })
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

        const { data: existingPayment } = await supabase
            .from('payments')
            .select('id')
            .eq('booking_id', bookingId)
            .maybeSingle()

        if (existingPayment?.id) {
            await supabase
                .from('payments')
                .update(paymentPayload as never)
                .eq('id', existingPayment.id)
        } else {
            await supabase.from('payments').insert(paymentPayload as never)
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
