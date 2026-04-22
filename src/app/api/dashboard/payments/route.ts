import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type MaybeArray<T> = T | T[] | null | undefined
function firstItem<T>(value: MaybeArray<T>): T | undefined {
    if (!value) return undefined
    return Array.isArray(value) ? value[0] : value
}

export async function GET() {
    try {
        const supabase = createAdminClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                booking_reference,
                final_amount,
                payment_status,
                status,
                created_at,
                payment_method,
                trips (
                    id,
                    departure_time,
                    route:routes (
                        origin,
                        destination
                    )
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        const payments = (data || []).map((b) => {
            const trip = firstItem(b.trips as MaybeArray<{ route?: { origin?: string; destination?: string } }>)
            const origin = trip?.route?.origin
            const destination = trip?.route?.destination

            return {
            id: b.id,
            booking_reference: b.booking_reference,
            transaction_id: `TXN-${b.booking_reference.toUpperCase()}`,
            amount: b.final_amount,
            currency: 'INR',
            status: b.payment_status || b.status,
            method: b.payment_method || 'Online',
            date: b.created_at,
            route: origin && destination ? `${origin} to ${destination}` : 'Unknown Route',
            }
        })

        return NextResponse.json(payments)
    } catch (err) {
        console.error('Payment history error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
