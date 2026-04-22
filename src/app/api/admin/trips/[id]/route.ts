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
        const { data, error } = await supabase
            .from('trips')
            .select('*, route:routes(*), bus:buses(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Trip not found'
        return NextResponse.json({ message }, { status: 404 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const { id } = await params
    try {
        const payload = await req.json()
        const supabase = await getDbClient()
        const { data, error } = await supabase.from('trips').update(payload as never).eq('id', id).select().single()
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update trip'
        return NextResponse.json({ message }, { status: 400 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const { id } = await params
    try {
        const supabase = await getDbClient()
        const { error } = await supabase.from('trips').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete trip'
        return NextResponse.json({ message }, { status: 400 })
    }
}
