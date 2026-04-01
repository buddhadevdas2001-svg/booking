import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateDynamicPrice } from '@/lib/pricing_engine'
import type { SearchTrip, SeatLayout } from '@/types/supabase'

type TripDetail = SearchTrip & {
    bus_id?: string
    seat_layout_id?: string | null
    seat_layout?: SeatLayout
    pricing_context?: ReturnType<typeof calculateDynamicPrice>
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createAdminClient()
        
        const { data: trip, error } = await supabase
            .from('trips')
            .select(`
                *,
                route:routes(*),
                bus:buses(*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 })

        const tripData = { ...trip } as TripDetail

        // Priority 1: Check if trip has an explicit seat_layout_id
        if (tripData.seat_layout_id) {
            const { data: seat_layout } = await supabase
                .from('seat_layouts')
                .select('*')
                .eq('id', tripData.seat_layout_id)
                .single()
            if (seat_layout) {
                tripData.seat_layout = seat_layout as SeatLayout
            }
        } 
        
        // Priority 2: Fallback to the bus's active layout if no layout attached yet
        if (!tripData.seat_layout && tripData.bus_id) {
            const { data: layouts } = await supabase
                .from('seat_layouts')
                .select('*')
                .eq('bus_id', tripData.bus_id)
                .order('is_active', { ascending: false })
                .order('updated_at', { ascending: false })
                .limit(1)

            if (layouts && layouts.length > 0) {
                tripData.seat_layout = layouts[0] as SeatLayout
            }
        }

        // Calculate dynamic pricing context
        tripData.pricing_context = calculateDynamicPrice({
            base_price: Number(tripData.base_price) || 0,
            departure_time: tripData.departure_time,
            available_seats: Number(tripData.available_seats) || 0,
            total_seats: Number(tripData.total_seats) || 0,
        })

        return NextResponse.json(tripData)
    } catch (err) {
        console.error('Trip Detail Error:', err)
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed to fetch trip details' },
            { status: 500 }
        )
    }
}
