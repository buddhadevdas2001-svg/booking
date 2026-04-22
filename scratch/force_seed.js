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

const supabase = createClient(url, key)

async function forceSeed() {
    console.log('Fetching trips with bus data...')
    const { data: trips } = await supabase.from('trips').select('id, total_seats, bus:buses(total_seats)').limit(20)
    
    console.log('Correcting trip occupancy...')
    for (const trip of trips) {
        const busTotal = trip.bus ? trip.bus.total_seats : 40
        const actualTotal = trip.total_seats || busTotal || 40
        
        // Let's set some realistic occupancy: 12 booked out of 40
        const filled = Math.floor(Math.random() * 15) + 5 
        const available = Math.max(0, actualTotal - filled)
        
        console.log(`Trip ${trip.id}: total=${actualTotal}, setting available to ${available} (${filled} booked)`)
        await supabase.from('trips').update({ 
            available_seats: available,
            total_seats: actualTotal 
        }).eq('id', trip.id)
    }
    
    console.log('Done.')
}

forceSeed()
