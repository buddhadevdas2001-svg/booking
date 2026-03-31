import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('routes')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(6)
            
        if (error) {
            const { data: allData, error: allErr } = await supabase.from('routes').select('*').limit(6)
            if (allErr) throw allErr
            return NextResponse.json(allData || [])
        }

        return NextResponse.json(data || [])
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Failed' },
            { status: 500 }
        )
    }
}
