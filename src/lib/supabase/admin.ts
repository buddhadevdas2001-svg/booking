import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

// Hardcoded fallbacks — same project that env.ts uses
const DEFAULT_SUPABASE_URL = 'https://xboqpqltsohakwbhrkgz.supabase.co'

function readLocalEnvValue(key: string): string {
    try {
        const filePath = path.join(process.cwd(), '.env.local')
        if (!fs.existsSync(filePath)) return ''
        const content = fs.readFileSync(filePath, 'utf8')
        for (const rawLine of content.split(/\r?\n/)) {
            const line = rawLine.trim()
            if (!line || line.startsWith('#')) continue
            const sep = line.indexOf('=')
            if (sep === -1) continue
            const envKey = line.slice(0, sep).trim()
            if (envKey !== key) continue
            return line.slice(sep + 1).trim()
        }
        return ''
    } catch {
        return ''
    }
}

export function createAdminClient() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        readLocalEnvValue('NEXT_PUBLIC_SUPABASE_URL') ||
        readLocalEnvValue('SUPABASE_URL') ||
        DEFAULT_SUPABASE_URL

    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY ||
        readLocalEnvValue('SUPABASE_SERVICE_ROLE_KEY') ||
        readLocalEnvValue('SUPABASE_SECRET_KEY')

    if (!serviceRoleKey) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your .env.local file. ' +
            'Get it from: https://supabase.com/dashboard/project/xboqpqltsohakwbhrkgz/settings/api'
        )
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
