import { createClient } from '@supabase/supabase-js'
import { getServiceRoleKey } from '@/lib/env'
import { Database } from '@/types/supabase'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = getServiceRoleKey()

    if (!supabaseUrl) {
        throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set')
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
