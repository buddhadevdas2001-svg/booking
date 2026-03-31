import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const date = searchParams.get('date')

        const supabase = createAdminClient()
        let query = supabase
            .from('bookings')
            .select(`
                *,
                profiles:user_id (
                    full_name
                )
            `)
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        if (date) {
            query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`)
        }

        const { data, error } = await query
        if (error) throw error

        // Since we don't have a separate 'payments' table in your simplified schema yet,
        // we map bookings to a payment-like structure for the dashboard to work.
        const mockPayments = (data || []).map(b => ({
            id: b.id,
            booking_id: b.id,
            transaction_id: `TXN-${b.booking_reference}`,
            amount: b.final_amount,
            currency: 'INR',
            gateway: 'Stripe',
            status: b.payment_status || b.status,
            created_at: b.created_at,
            booking: {
                booking_reference: b.booking_reference,
                profiles: b.profiles
            }
        }))

        return NextResponse.json(mockPayments)
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
