
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xboqpqltsohakwbhrkgz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3FwcWx0c29oYWt3Ymhya2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjQyMywiZXhwIjoyMDkwNTA4NDIzfQ.hxJjVdkL5gHVmVmiZnqzdMqLwEQq7CJvcAOGB4fN-Lk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('--- Seeding Popular Routes and Trips ---')

    const routesData = [
        { origin: 'Kolkata', destination: 'Siliguri', origin_code: 'CCU', destination_code: 'IXB', distance_km: 580, estimated_duration_minutes: 720 },
        { origin: 'Kolkata', destination: 'Digha', origin_code: 'CCU', destination_code: 'DIG', distance_km: 180, estimated_duration_minutes: 240 },
        { origin: 'Kolkata', destination: 'Darjeeling', origin_code: 'CCU', destination_code: 'DAR', distance_km: 630, estimated_duration_minutes: 840 },
        { origin: 'Siliguri', destination: 'Kolkata', origin_code: 'IXB', destination_code: 'CCU', distance_km: 580, estimated_duration_minutes: 720 },
        { origin: 'Kolkata', destination: 'Mandarmani', origin_code: 'CCU', destination_code: 'MMN', distance_km: 170, estimated_duration_minutes: 240 },
    ]

    const busesData = [
        { name: 'Scania Premium AC Sleeper', registration_number: 'WB-01-A-1234', bus_type: 'AC Sleeper', total_seats: 40 },
        { name: 'Volvo B11R AC Seater', registration_number: 'WB-01-B-5678', bus_type: 'AC Seater', total_seats: 55 },
        { name: 'Mercedes SHD Lux Sleeper', registration_number: 'WB-01-C-9012', bus_type: 'AC Sleeper', total_seats: 36 },
        { name: 'Ashok Leyland JanBus', registration_number: 'WB-01-D-3456', bus_type: 'Non-AC Seater', total_seats: 50 },
    ]

    // 1. Seed Routes
    console.log('Syncing routes...')
    const routeMap = new Map()
    for (const r of routesData) {
        const { data: existing } = await supabase.from('routes').select('id').eq('origin', r.origin).eq('destination', r.destination).maybeSingle()
        if (existing) {
            routeMap.set(`${r.origin}-${r.destination}`, existing.id)
            console.log(`Route exists: ${r.origin}-${r.destination}`)
        } else {
            const { data: inserted, error } = await supabase.from('routes').insert({ ...r, is_active: true }).select('id').single()
            if (error) {
                console.error(`Error inserting route ${r.origin}-${r.destination}:`, error.message)
            } else {
                routeMap.set(`${r.origin}-${r.destination}`, inserted.id)
                console.log(`Route inserted: ${r.origin}-${r.destination}`)
            }
        }
    }

    // 2. Seed Buses
    console.log('Syncing buses...')
    const busMap = new Map()
    for (const b of busesData) {
        const { data: existing } = await supabase.from('buses').select('id').eq('registration_number', b.registration_number).maybeSingle()
        if (existing) {
            busMap.set(b.name, existing.id)
            console.log(`Bus exists: ${b.name}`)
        } else {
            const { data: inserted, error } = await supabase.from('buses').insert({ ...b, is_active: true }).select('id').single()
            if (error) {
                console.error(`Error inserting bus ${b.name}:`, error.message)
            } else {
                busMap.set(b.name, inserted.id)
                console.log(`Bus inserted: ${b.name}`)
            }
        }
    }

    // 3. Seed Trips (Future trips)
    console.log('Creating future trips...')
    const now = new Date()
    const tripTemplates = [
        { routeKey: 'Kolkata-Siliguri', busName: 'Scania Premium AC Sleeper', offset: 18, price: 1499 },
        { routeKey: 'Kolkata-Digha', busName: 'Volvo B11R AC Seater', offset: 12, price: 699 },
        { routeKey: 'Kolkata-Darjeeling', busName: 'Mercedes SHD Lux Sleeper', offset: 24, price: 1699 },
        { routeKey: 'Siliguri-Kolkata', busName: 'Ashok Leyland JanBus', offset: 10, price: 999 },
        { routeKey: 'Kolkata-Mandarmani', busName: 'Volvo B11R AC Seater', offset: 6, price: 749 },
    ]

    for (const t of tripTemplates) {
        const routeId = routeMap.get(t.routeKey)
        const busId = busMap.get(t.busName)

        if (!routeId || !busId) {
            console.error(`Missing ID for ${t.routeKey} or ${t.busName}`)
            continue
        }

        const departure = new Date(now.getTime() + t.offset * 60 * 60 * 1000)
        const arrival = new Date(departure.getTime() + 8 * 60 * 60 * 1000)

        const { error } = await supabase.from('trips').insert({
            route_id: routeId,
            bus_id: busId,
            departure_time: departure.toISOString(),
            arrival_time: arrival.toISOString(),
            base_price: t.price,
            available_seats: 40, // Assume 40 for simplicity
            total_seats: 40,
            status: 'scheduled',
            boarding_points: [{ name: 'Main Bus Stand', time: departure.toISOString() }],
            dropping_points: [{ name: 'City Center', time: arrival.toISOString() }]
        })

        if (error) console.error(`Error creating trip for ${t.routeKey}:`, error.message)
        else console.log(`Trip created for ${t.routeKey} at ${departure.toLocaleString()}`)
    }

    console.log('--- Seed Complete ---')
}

seed()
