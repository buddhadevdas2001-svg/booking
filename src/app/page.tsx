import { createAdminClient } from '@/lib/supabase/admin'
import HomeContent from '@/components/home/HomeContent'
import type { Route, Coupon } from '@/types/supabase'

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
        .select('*, trips(base_price)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)
        
    if (routesError) return []

    return (routesData || []).map(route => {
        const prices = ((route.trips as Array<{ base_price: string | number }>) || [])
            .map(t => Number(t.base_price))
            .filter(p => !isNaN(p) && p > 0);
        
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
