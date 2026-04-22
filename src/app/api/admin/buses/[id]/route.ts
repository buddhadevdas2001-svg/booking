import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { requireAdminRequest } from '@/lib/admin-auth'

// Safe DB client: uses admin client (bypasses RLS) if service role key is set, 
// otherwise falls back to server client (uses RLS with current user session).
async function getDbClient() {
    try {
        return createAdminClient()
    } catch {
        return createServerClient()
    }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const { id } = await params
    try {
        const supabase = await getDbClient()
        const { data, error } = await supabase.from('buses').select('*').eq('id', id).single()
        if (error) {
            const status = error.code === 'PGRST116' ? 404 : 400
            return NextResponse.json({ message: error.message }, { status })
        }
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error'
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const { id } = await params
    try {
        const payload = await req.json()
        const supabase = await getDbClient()
        const { data, error } = await supabase.from('buses').update(payload as never).eq('id', id).select().single()
        if (error) return NextResponse.json({ message: error.message }, { status: 400 })
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error'
        return NextResponse.json({ message }, { status: 500 })
    }
}
