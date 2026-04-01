import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminRequest } from '@/lib/admin-auth'

export async function GET() {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response

    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch coupons'
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response

    try {
        const payload = await req.json()
        const supabase = createAdminClient()

        // Validate basic fields
        if (!payload.code || !payload.discount_type || !payload.discount_value) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('coupons')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create coupon'
        return NextResponse.json({ message }, { status: 400 })
    }
}
