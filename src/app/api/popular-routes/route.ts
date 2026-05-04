import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateDynamicPrice } from '@/lib/pricing_engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        const supabase = createAdminClient()
        const { data: routesData, error: routesError } = await supabase
            .from('routes')
            .select(`
                *,
                trips!inner(base_price, departure_time, available_seats, total_seats)
            `)
            .eq('is_active', true)
            .eq('trips.status', 'scheduled')
            .gt('trips.departure_time', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(6)
            
        if (routesError) throw routesError

        const processedRoutes = (routesData || []).map(route => {
            const trips = (route.trips as any[]) || [];
            const prices = trips.map(t => {
                const pricing = calculateDynamicPrice({
                    base_price: Number(t.base_price),
                    departure_time: t.departure_time,
                    available_seats: Number(t.available_seats),
                    total_seats: Number(t.total_seats)
                });
                return pricing.effective_price;
            }).filter(p => !isNaN(p) && p > 0);
            
            return {
                ...route,
                min_price: prices.length > 0 ? Math.min(...prices) : 499
            };
        });

        return NextResponse.json(processedRoutes)
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Failed')
        const errorCode = typeof err === 'object' && err && 'code' in err ? String(err.code) : ''
        // If the error code as 42P01 (table not found) or 42501 (permission denied) return empty list instead of 500
        if (errorCode === '42P01' || errorCode === '42501' || error.message.includes('permission denied for schema public')) {
            console.warn('Database tables not found, returning empty popular routes.')
            return NextResponse.json([])
        }
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}
