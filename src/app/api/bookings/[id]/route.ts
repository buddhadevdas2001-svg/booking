import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateDynamicPrice } from '@/lib/pricing_engine'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { reason, refund_requested } = body

  const supabase = createClient()

  // Get booking with trip details
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, trip:trips(*), user_id')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Check if cancellable
  const trip = booking.trip
  const hoursUntilDeparture = (new Date(trip.departure_time).getTime() - Date.now()) / (36e5)
  const cancellationsAllowed = trip.cancellations_allowed_until_hours || 2

  if (hoursUntilDeparture < cancellationsAllowed) {
    return NextResponse.json(
      { error: `Cannot cancel less than ${cancellationsAllowed} hours before departure` },
      { status: 400 }
    )
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
  }

  try {
    // Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Optional: Trigger refund if paid
    if (booking.payment_status === 'succeeded' && refund_requested !== false) {
      // Stripe refund logic here (call Stripe API)
      console.log('Processing Stripe refund for:', booking.stripe_payment_intent_id)
      // await stripe.refunds.create({ payment_intent: booking.stripe_payment_intent_id })
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: booking.user_id,
      type: 'email',
      title: 'Booking Cancelled',
      message: `Your booking ${booking.booking_reference} has been successfully cancelled.`,
      data: { booking_id: id }
    })

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}

