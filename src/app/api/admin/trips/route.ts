import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminRequest } from '@/lib/admin-auth'

export async function GET() {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('trips')
            .select('*, route:routes(*), bus:buses(*)')
            .order('departure_time', { ascending: true })
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch trips'
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const payload = await req.json()
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('trips').insert(payload).select().single()
        if (error) throw error
        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create trip'
        return NextResponse.json({ message }, { status: 400 })
    }
}
