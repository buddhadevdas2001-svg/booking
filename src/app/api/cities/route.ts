import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type CitiesRouteRow = {
    origin?: string | null
    destination?: string | null
}

export async function GET() {
    try {
        const supabase = createAdminClient()
        // Simplify to avoid errors on potentially missing is_active column
        const { data, error } = await supabase.from('routes').select('origin, destination')
        
        if (error) throw error

        const cities = new Set<string>()
        ;((data || []) as CitiesRouteRow[]).forEach((r) => {
            if (r.origin) cities.add(r.origin.trim())
            if (r.destination) cities.add(r.destination.trim())
        })

        return NextResponse.json(Array.from(cities).sort())
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Failed to fetch cities')
        const errorCode = typeof err === 'object' && err && 'code' in err ? String(err.code) : ''
        // If the error code is 42P01 (table not found) or 42501 (permission denied) return empty list instead of 500
        if (errorCode === '42P01' || errorCode === '42501' || error.message.includes('permission denied for schema public')) {
            console.warn('Database tables not found, returning empty cities list.')
            return NextResponse.json([])
        }
        console.error('Cities Fetch Error:', err)
        return NextResponse.json({ message: 'Failed', error: error.message }, { status: 500 })
    }
}
