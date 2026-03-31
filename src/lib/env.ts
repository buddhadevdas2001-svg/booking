const DEFAULT_SUPABASE_URL = 'https://xboqpqltsohakwbhrkgz.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_6mGI6ljajA7sx2OQ29FQZQ_J5sxQayc'

function getEnvValue(key: string) {
    return process.env[key] || ''
}

export function getRequiredPublicSupabaseEnv() {
    const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL') || DEFAULT_SUPABASE_URL
    const supabaseAnonKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY

    return { supabaseUrl, supabaseAnonKey }
}

export function getServiceRoleKey() {
    const key = getEnvValue('SUPABASE_SERVICE_ROLE_KEY')
    if (!key) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }
    return key
}

export const env = {
    supabaseUrl: getEnvValue('NEXT_PUBLIC_SUPABASE_URL') || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    serviceRoleKey: getEnvValue('SUPABASE_SERVICE_ROLE_KEY') || '',
}
