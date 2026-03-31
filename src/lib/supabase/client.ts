import { createBrowserClient } from '@supabase/ssr'
import { getRequiredPublicSupabaseEnv } from '@/lib/env'
import { Database } from '@/types/supabase'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
    if (browserClient) return browserClient

    const { supabaseUrl, supabaseAnonKey } = getRequiredPublicSupabaseEnv()
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    return browserClient
}
