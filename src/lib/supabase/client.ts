import { createBrowserClient } from '@supabase/ssr'
import { getRequiredPublicSupabaseEnv } from '@/lib/env'

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (browserClient) return browserClient

    const { supabaseUrl, supabaseAnonKey } = getRequiredPublicSupabaseEnv()
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    return browserClient
}
