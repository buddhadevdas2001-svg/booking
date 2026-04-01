import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()

        // Try 'offers' first
        let result = await supabase
            .from('offers')
            .select('*')
            .eq('is_active', true)
            .limit(3)
            
        if (result.error) {
            console.warn('Offers table fetch failed, trying coupons fallback...', result.error.message)
            // Fallback to 'coupons'
            result = await supabase
                .from('coupons')
                .select('*')
                .eq('is_active', true)
                .limit(3)
        }
            
        if (result.error) {
            console.error('Final Offers/Coupons Error:', result.error)
            // Return empty array instead of 500 to keep UI stable
            return NextResponse.json([])
        }
        
        return NextResponse.json(result.data || [])
    } catch (err) {
        console.error('Global Offers API Error:', err)
        return NextResponse.json([], { status: 200 }) // Return empty array to prevent UI crash
    }
}
