import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { code, cartTotal } = await req.json()

        if (!code) {
            return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const now = new Date().toISOString()

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .lte('valid_from', now)
            .gte('valid_until', now)
            .maybeSingle()

        if (error) throw error

        if (!coupon) {
            return NextResponse.json({ message: 'Invalid or expired coupon code' }, { status: 404 })
        }

        // Check usage limit
        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
            return NextResponse.json({ message: 'This coupon has reached its usage limit' }, { status: 400 })
        }

        // Check minimum purchase amount
        if (coupon.min_purchase_amount !== null && cartTotal < coupon.min_purchase_amount) {
            return NextResponse.json({
                message: `Minimum order of ₹${coupon.min_purchase_amount} required for this coupon`,
            }, { status: 400 })
        }

        // Calculate discount
        let discountAmount = 0
        if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round((cartTotal * coupon.discount_value) / 100)
            if (coupon.max_discount_amount !== null) {
                discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
            }
        } else {
            discountAmount = Math.min(coupon.discount_value, cartTotal)
        }

        return NextResponse.json({ coupon, discountAmount })

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to validate coupon'
        return NextResponse.json({ message }, { status: 500 })
    }
}
