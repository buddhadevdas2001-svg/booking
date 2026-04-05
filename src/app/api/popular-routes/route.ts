import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()
        const { data: routesData, error: routesError } = await supabase
            .from('routes')
            .select('*, trips(base_price)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(6)
            
        if (routesError) throw routesError

        const processedRoutes = (routesData || []).map(route => {
            const prices = ((route.trips as Array<{ base_price: string | number }>) || [])
                .map(t => Number(t.base_price))
                .filter(p => !isNaN(p) && p > 0);
            
            return {
                ...route,
                min_price: prices.length > 0 ? Math.min(...prices) : 499 // Fallback to 499 if no trips
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
