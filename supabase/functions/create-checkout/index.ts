// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.25.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  try {
    const { booking_id, success_url, cancel_url } = await req.json()

    // Get booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trip:trips(*),
        booking_seats(*)
      `)
      .eq('id', booking_id)
      .single()

    if (error) throw error

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Shamolly Bus Ticket - ${booking.trip?.route?.origin} to ${booking.trip?.route?.destination}`,
              description: `Seats: ${booking.booking_seats.map((s: any) => s.seat_label).join(', ')}`,
              images: ['https://shamolly.com/logo.png'],
            },
            unit_amount: booking.final_amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        booking_id: booking.id,
        trip_id: booking.trip_id,
        user_id: booking.user_id,
        seat_labels: JSON.stringify(booking.booking_seats.map((s: any) => s.seat_label)),
      },
      
      customer_email: booking.contact_email,
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
