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
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing Stripe webhook configuration', { status: 400 })
  }

  const body = await req.text()

  try {
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session)
    }

    if (event.type === 'payment_intent.payment_failed') {
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
    }

    if (event.type === 'charge.refunded') {
      await handleRefund(event.data.object as Stripe.Charge)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Webhook error', { status: 400 })
  }
})

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id
  const tripId = session.metadata?.trip_id
  const userId = session.metadata?.user_id
  const seatLabels = JSON.parse(session.metadata?.seat_labels || '[]')

  if (!bookingId) return

  const { data: booking } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'succeeded',
      stripe_payment_intent_id: String(session.payment_intent || ''),
      stripe_session_id: session.id,
    })
    .eq('id', bookingId)
    .select()
    .single()

  await supabase.from('payments').insert({
    booking_id: bookingId,
    transaction_id: String(session.payment_intent || session.id),
    gateway: 'stripe',
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || 'inr',
    status: 'success',
    gateway_response: session,
  })

  if (tripId && userId) {
    await supabase.from('seat_locks').delete().eq('trip_id', tripId).eq('user_id', userId)
  }

  const qrCodeUrl = await uploadQrCode(bookingId, seatLabels)
  if (qrCodeUrl) {
    await supabase.from('bookings').update({ qr_code_url: qrCodeUrl }).eq('id', bookingId)
  }

  if (booking?.contact_email) {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: booking.contact_email,
        subject: `Booking Confirmed: ${booking.booking_reference}`,
        html: `
          <h1>Booking Confirmed</h1>
          <p>Your booking reference is <strong>${booking.booking_reference}</strong>.</p>
          <p>Seats: ${seatLabels.join(', ')}</p>
          <p>Total Amount: ₹${booking.final_amount}</p>
          ${qrCodeUrl ? `<p><img src="${qrCodeUrl}" alt="QR Code" /></p>` : ''}
        `,
      }),
    })
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.booking_id
  const tripId = paymentIntent.metadata?.trip_id
  const userId = paymentIntent.metadata?.user_id

  if (bookingId) {
    await supabase.from('bookings').update({ status: 'failed', payment_status: 'failed' }).eq('id', bookingId)
  }

  if (tripId && userId) {
    await supabase.from('seat_locks').delete().eq('trip_id', tripId).eq('user_id', userId)
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const bookingId = charge.metadata?.booking_id
  if (!bookingId) return

  await supabase
    .from('bookings')
    .update({
      status: 'refunded',
      payment_status: 'refunded',
      refund_amount: charge.amount_refunded / 100,
      refund_transaction_id: charge.id,
    })
    .eq('id', bookingId)
}

async function uploadQrCode(bookingId: string, seats: string[]) {
  const payload = JSON.stringify({
    booking_id: bookingId,
    seats,
    generated_at: new Date().toISOString(),
  })

  const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`)
  if (!qrResponse.ok) return null

  const qrBlob = await qrResponse.blob()
  const upload = await supabase.storage.from('qr-codes').upload(`${bookingId}.png`, qrBlob, {
    contentType: 'image/png',
    upsert: true,
  })

  if (upload.error) return null

  const { data } = supabase.storage.from('qr-codes').getPublicUrl(`${bookingId}.png`)
  return data.publicUrl
}
