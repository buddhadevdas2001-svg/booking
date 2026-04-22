const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

function readLocalEnvValue(key) {
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

const url = readLocalEnvValue('NEXT_PUBLIC_SUPABASE_URL')
const key = readLocalEnvValue('SUPABASE_SERVICE_ROLE_KEY')

if (!url || !key) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(url, key)

async function check() {
    const { data: trips } = await supabase.from('trips').select('id, available_seats, total_seats').limit(5)
    console.log('Trips:', trips)
    const { data: bookings } = await supabase.from('bookings').select('id, trip_id').limit(5)
    console.log('Bookings:', bookings)
}

check()
