import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminRequest } from '@/lib/admin-auth'

export async function GET() {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('buses').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch buses'
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const payload = await req.json()
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('buses').insert(payload).select().single()
        if (error) {
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error'
        return NextResponse.json({ message }, { status: 500 })
    }
}
