import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    // using Anon key
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    // We don't have auth token locally in server here, so we will fail RLS. Let's see what error we get.
    const { data, error } = await supabase
        .from('bookings')
        .insert({
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            trip_id: '123e4567-e89b-12d3-a456-426614174000',
            total_amount: 100,
            final_amount: 100,
            passenger_details: { "test": "test" },
            contact_email: 'test@example.com',
            contact_phone: '1234567890',
            status: 'pending',
            payment_status: 'pending'
        })
        .select()
        .single() // use single to trigger the identical payload

    return NextResponse.json({ data, error })
}
