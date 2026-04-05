import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: trip_id } = await params
        const { staff_id, role } = await req.json()
        
        if (!staff_id || !role) {
            return NextResponse.json({ error: 'Missing required fields: staff_id and role' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase.from('trip_staff').insert({
            trip_id,
            staff_id,
            role
        }).select().single()
        
        if (error) {
            console.error('[API] trip_staff POST insert error:', error)
            throw error
        }
        
        return NextResponse.json({ success: true, data })
    } catch (e: unknown) {
        console.error('Trip Staff Assignment Error:', e)
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const url = new URL(req.url)
        const assignmentId = url.searchParams.get('assignmentId')
        
        if (!assignmentId) {
            return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase.from('trip_staff').delete().eq('id', assignmentId)
        
        if (error) {
            console.error('[API] trip_staff DELETE error:', error)
            throw error
        }
        
        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        console.error('Trip Staff Removal Error:', e)
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal server error' }, { status: 500 })
    }
}
