import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()
        // Simplify to avoid errors on potentially missing is_active column
        const { data, error } = await supabase.from('routes').select('origin, destination')
        
        if (error) throw error

        const cities = new Set<string>()
        ;(data || []).forEach(r => {
            if (r.origin) cities.add(r.origin.trim())
            if (r.destination) cities.add(r.destination.trim())
        })

        return NextResponse.json(Array.from(cities).sort())
    } catch (err) {
        console.error('Cities Fetch Error:', err)
        return NextResponse.json({ message: 'Failed' }, { status: 500 })
    }
}
