import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

type SeatSelection = { id: string; label: string }
type PassengerBySeat = Record<string, { name?: string; age?: number }>

export async function POST(req: NextRequest) {
    try {
        const userSupabase = await createServerClient()
        const {
            data: { user },
            error: authError,
        } = await userSupabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = (await req.json()) as {
            tripId?: string
            selectedSeats?: SeatSelection[]
            passengerDetails?: PassengerBySeat
            contactEmail?: string
            contactPhone?: string
            couponCode?: string
        }
        const { tripId, selectedSeats, passengerDetails, contactEmail, contactPhone, couponCode } = body

        if (!tripId || !selectedSeats?.length) {
            return NextResponse.json({ message: 'Missing required booking parameters' }, { status: 400 })
        }
        if (!contactEmail || !contactPhone) {
            return NextResponse.json({ message: 'Missing contact information' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // 1. Fetch trip securely to get accurate pricing
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('base_price')
            .eq('id', tripId)
            .single()

        if (tripError || !trip) {
            return NextResponse.json({ message: 'Trip not found or unavailable' }, { status: 404 })
        }

        const basePrice = Number(trip.base_price) || 0
        const subtotal = selectedSeats.length * basePrice
        const gst = Math.round(subtotal * 0.05)
        const convenienceFee = selectedSeats.length > 0 ? 50 : 0

        // 2. Server-side coupon validation (never trust client discount)
        let discountAmount = 0
        let validatedCouponId: string | null = null

        if (couponCode) {
            const now = new Date().toISOString()
            const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase().trim())
                .eq('is_active', true)
                .lte('valid_from', now)
                .gte('valid_until', now)
                .maybeSingle()

            if (coupon) {
                const usageOk = coupon.usage_limit === null || coupon.used_count < coupon.usage_limit
                const minOk = coupon.min_purchase_amount === null || subtotal >= coupon.min_purchase_amount

                if (usageOk && minOk) {
                    if (coupon.discount_type === 'percentage') {
                        discountAmount = Math.round((subtotal * coupon.discount_value) / 100)
                        if (coupon.max_discount_amount !== null) {
                            discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
                        }
                    } else {
                        discountAmount = Math.min(coupon.discount_value, subtotal)
                    }
                    validatedCouponId = coupon.id
                }
            }
        }

        const finalAmount = Math.max(0, subtotal + gst + convenienceFee - discountAmount)

        // 3. Insert Booking securely
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                trip_id: tripId,
                total_amount: subtotal,
                discount_amount: discountAmount,
                final_amount: finalAmount,
                passenger_details: Object.fromEntries(
                    selectedSeats.map((seat) => [
                        seat.id,
                        { name: passengerDetails?.[seat.id]?.name, age: passengerDetails?.[seat.id]?.age }
                    ])
                ),
                contact_email: contactEmail,
                contact_phone: contactPhone,
                status: 'pending',
                payment_status: 'pending'
            } as never)
            .select()
            .single()

        if (bookingError) {
            console.error('[API/Booking] Error inserting booking:', bookingError)
            return NextResponse.json({ message: 'Failed to create booking record: ' + bookingError.message }, { status: 409 })
        }

        // 4. Insert Booking Seats securely
        const seatPayload = selectedSeats.map((seat) => ({
            booking_id: booking.id,
            seat_label: seat.label,
            passenger_name: passengerDetails?.[seat.id]?.name,
            passenger_age: Number(passengerDetails?.[seat.id]?.age),
            price: basePrice,
            status: 'confirmed'
        }))

        const { error: seatError } = await supabase.from('booking_seats').insert(seatPayload as never)

        if (seatError) {
            console.error('[API/Booking] Error inserting booking seats:', seatError)
            return NextResponse.json({ message: 'Failed to reserve seats: ' + seatError.message }, { status: 500 })
        }

        // 5. Increment coupon usage if a valid coupon was applied
        if (validatedCouponId) {
            const { data: couponRow } = await supabase
                .from('coupons')
                .select('used_count')
                .eq('id', validatedCouponId)
                .single()
            if (couponRow) {
                await supabase
                    .from('coupons')
                    .update({ used_count: ((couponRow as Record<string, number>).used_count || 0) + 1 })
                    .eq('id', validatedCouponId)
            }
        }

        return NextResponse.json({ bookingId: booking.id })

    } catch (err) {
        console.error('[API/Booking] Critical failure:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}

