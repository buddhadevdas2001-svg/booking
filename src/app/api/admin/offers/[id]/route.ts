import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('offers').select('*').eq('id', id).single()
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Offer not found'
        return NextResponse.json({ message }, { status: 404 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const payload = await req.json()
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('offers').update(payload as never).eq('id', id).select().single()
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update offer'
        return NextResponse.json({ message }, { status: 400 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const supabase = createAdminClient()
        const { error } = await supabase.from('offers').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete offer'
        return NextResponse.json({ message }, { status: 400 })
    }
}
