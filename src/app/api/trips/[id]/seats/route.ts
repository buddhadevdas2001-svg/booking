import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createAdminClient()
        
        const { data, error } = await supabase.rpc('get_available_seats', { p_trip_id: id })
        if (error) throw error

        return NextResponse.json(data || [])
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to fetch seats' },
            { status: 500 }
        )
    }
}
