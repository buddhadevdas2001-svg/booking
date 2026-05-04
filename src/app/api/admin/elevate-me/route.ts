import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    return POST()
}

export async function POST() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ message: 'Not logged in' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
        .from('profiles')
        .update({ role: 'admin' } as never)
        .eq('id', user.id)

    if (updateError) {
        return NextResponse.json({ message: 'Update failed', error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'You are now an admin!' })
}
