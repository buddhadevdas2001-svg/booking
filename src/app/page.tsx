import { createAdminClient } from '@/lib/supabase/admin'
import HomeContent from '@/components/home/HomeContent'
import type { Route, Coupon } from '@/types/supabase'
import { calculateDynamicPrice } from '@/lib/pricing_engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getCities() {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('routes').select('origin, destination')
    if (error) return []
    const origins = data.map(r => r.origin)
    const destinations = data.map(r => r.destination)
    return Array.from(new Set([...origins, ...destinations])).sort()
}

async function getPopularRoutes() {
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
        
    if (routesError) return []

    return (routesData || []).map(route => {
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
    }) as Route[]
}

async function getOffers() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
    
    if (error) return []
    return data as Coupon[]
}

export default async function HomePage() {
    // Parallel data fetching on the server
    const [cities, popularRoutes, offers] = await Promise.all([
        getCities(),
        getPopularRoutes(),
        getOffers()
    ])

    return (
        <HomeContent 
            cities={cities} 
            popularRoutes={popularRoutes} 
            offers={offers} 
        />
    )
}
