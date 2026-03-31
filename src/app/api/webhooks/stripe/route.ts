import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
})

// Note: You need to set 'STRIPE_WEBHOOK_SECRET' in your .env after finding it in Stripe Dashboard (using 'stripe-cli' in development)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const sig = req.headers.get('stripe-signature')

        if (!sig || !webhookSecret) {
            console.error('Missing signature or webhook secret')
            return NextResponse.json({ message: 'Webhook Secret Required' }, { status: 400 })
        }

        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message)
            return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const bookingId = session.metadata?.bookingId
                
                if (bookingId) {
                    const { error: updateError } = await supabase
                        .from('bookings')
                        .update({
                            status: 'confirmed' as any,
                            payment_status: 'succeeded' as any,
                            updated_at: new Date().toISOString()
                        } as never)
                        .eq('id', bookingId)

                    if (updateError) {
                        console.error('Booking update failed:', updateError)
                    } else {
                        console.log('Booking confirmed:', bookingId)
                    }
                }
                break
            }
            case 'checkout.session.expired':
            case 'payment_intent.payment_failed': {
                const intent = event.data.object as Stripe.PaymentIntent
                const bookingId = intent.metadata?.bookingId
                
                if (bookingId) {
                    await supabase
                        .from('bookings')
                        .update({
                            status: 'failed' as any,
                            payment_status: 'failed' as any,
                            updated_at: new Date().toISOString()
                        } as never)
                        .eq('id', bookingId)
                }
                break
            }
            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook processing error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}

// Next.js Config: Make sure the body is not parsed by the framework automatically
export const config = {
    api: {
        bodyParser: false,
    },
}
