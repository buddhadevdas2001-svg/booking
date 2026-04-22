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
            .from('staff')
            .select(`
                *,
                user:profiles(id, full_name, phone, avatar_url)
            `)
            .eq('id', id)
            .single()
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Staff not found'
        return NextResponse.json({ message }, { status: 404 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const { id } = await params
    try {
        const payload = await req.json()
        const { full_name, phone, ...staffData } = payload
        const supabase = await getDbClient()

        // 1. Fetch current staff to get their user_id
        const { data: currentStaff, error: fetchError } = await supabase
            .from('staff')
            .select('user_id')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        // 2. Update profile if user_id exists
        if (currentStaff?.user_id) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name, phone })
                .eq('id', currentStaff.user_id)
            
            if (profileError) {
                console.error('SERVER UPDATE PROFILE ERROR:', profileError)
            }
        }

        // 3. Update staff record
        const { data, error } = await supabase
            .from('staff')
            .update(staffData as never)
            .eq('id', id)
            .select()
            .single()
        
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update staff'
        return NextResponse.json({ message }, { status: 400 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    const { id } = await params
    try {
        const supabase = await getDbClient()
        const { error } = await supabase.from('staff').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete staff'
        return NextResponse.json({ message }, { status: 400 })
    }
}
