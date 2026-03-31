// Sample data seeder for Supabase
// Run this in the browser console or as a script

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function seedDatabase() {
    try {
        console.log('Starting database seeding...')

        // 1. Create sample routes
        const routes = [
            {
                origin: 'Mumbai',
                destination: 'Pune',
                origin_code: 'BOM',
                destination_code: 'PNQ',
                distance_km: 150,
                estimated_duration_minutes: 210,
                is_active: true
            },
            {
                origin: 'Delhi',
                destination: 'Agra',
                origin_code: 'DEL',
                destination_code: 'AGR',
                distance_km: 200,
                estimated_duration_minutes: 240,
                is_active: true
            },
            {
                origin: 'Bangalore',
                destination: 'Chennai',
                origin_code: 'BLR',
                destination_code: 'MAA',
                distance_km: 350,
                estimated_duration_minutes: 360,
                is_active: true
            },
            {
                origin: 'Pune',
                destination: 'Goa',
                origin_code: 'PNQ',
                destination_code: 'GOI',
                distance_km: 450,
                estimated_duration_minutes: 600,
                is_active: true
            }
        ]

        console.log('Creating routes...')
        for (const route of routes) {
            const { data, error } = await supabase
                .from('routes')
                .insert(route as any)
                .select()
            if (error) {
                console.error('Error creating route:', error)
            } else {
                console.log('Created route:', data[0])
            }
        }

        // 2. Create sample buses
        const buses = [
            {
                name: 'Volvo AC Sleeper',
                registration_number: 'MH12AB1234',
                bus_type: 'AC Sleeper',
                total_seats: 40,
                amenities: ['AC', 'WiFi', 'Water Bottle'],
                is_active: true,
                features: {
                    ac: true,
                    wifi: true,
                    charging_point: true,
                    entertainment: false,
                    washroom: true,
                    water_bottle: true
                }
            },
            {
                name: 'Non-AC Seater',
                registration_number: 'MH12CD5678',
                bus_type: 'Non-AC Seater',
                total_seats: 50,
                amenities: ['Water Bottle'],
                is_active: true,
                features: {
                    ac: false,
                    wifi: false,
                    charging_point: false,
                    entertainment: false,
                    washroom: false,
                    water_bottle: true
                }
            }
        ]

        console.log('Creating buses...')
        for (const bus of buses) {
            const { data, error } = await supabase
                .from('buses')
                .insert(bus as any)
                .select()
            if (error) {
                console.error('Error creating bus:', error)
            } else {
                console.log('Created bus:', data[0])
            }
        }

        // 3. Create sample seat layouts
        const { data: busData } = await supabase.from('buses').select('id, name')
        const busDataTyped = busData as any[]
        if (busDataTyped && busDataTyped.length > 0) {
            const layouts = [
                {
                    name: 'Standard AC Sleeper Layout',
                    bus_id: busDataTyped[0].id,
                    layout_data: {
                        rows: 10,
                        cols: 4,
                        seats: [
                            { id: 'A1', label: 'A1', type: 'sleeper', row: 0, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'A2', label: 'A2', type: 'sleeper', row: 0, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'B1', label: 'B1', type: 'sleeper', row: 1, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'B2', label: 'B2', type: 'sleeper', row: 1, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'C1', label: 'C1', type: 'sleeper', row: 2, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'C2', label: 'C2', type: 'sleeper', row: 2, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'D1', label: 'D1', type: 'sleeper', row: 3, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'D2', label: 'D2', type: 'sleeper', row: 3, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'E1', label: 'E1', type: 'sleeper', row: 4, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'E2', label: 'E2', type: 'sleeper', row: 4, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'F1', label: 'F1', type: 'sleeper', row: 5, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'F2', label: 'F2', type: 'sleeper', row: 5, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'G1', label: 'G1', type: 'sleeper', row: 6, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'G2', label: 'G2', type: 'sleeper', row: 6, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'H1', label: 'H1', type: 'sleeper', row: 7, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'H2', label: 'H2', type: 'sleeper', row: 7, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'I1', label: 'I1', type: 'sleeper', row: 8, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'I2', label: 'I2', type: 'sleeper', row: 8, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'J1', label: 'J1', type: 'sleeper', row: 9, col: 0, deck: 'lower', price_multiplier: 1.0 },
                            { id: 'J2', label: 'J2', type: 'sleeper', row: 9, col: 1, deck: 'lower', price_multiplier: 1.0 },
                            // Upper deck
                            { id: 'UA1', label: 'UA1', type: 'sleeper', row: 0, col: 0, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UA2', label: 'UA2', type: 'sleeper', row: 0, col: 1, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UB1', label: 'UB1', type: 'sleeper', row: 1, col: 0, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UB2', label: 'UB2', type: 'sleeper', row: 1, col: 1, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UC1', label: 'UC1', type: 'sleeper', row: 2, col: 0, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UC2', label: 'UC2', type: 'sleeper', row: 2, col: 1, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UD1', label: 'UD1', type: 'sleeper', row: 3, col: 0, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UD2', label: 'UD2', type: 'sleeper', row: 3, col: 1, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UE1', label: 'UE1', type: 'sleeper', row: 4, col: 0, deck: 'upper', price_multiplier: 1.0 },
                            { id: 'UE2', label: 'UE2', type: 'sleeper', row: 4, col: 1, deck: 'upper', price_multiplier: 1.0 },
                        ],
                        hasUpperDeck: true,
                        aisle_positions: [2],
                        driver_position: { row: 9, col: 3 }
                    },
                    is_template: true,
                    is_active: true
                }
            ]

            console.log('Creating seat layouts...')
            for (const layout of layouts) {
                const { data, error } = await supabase
                    .from('seat_layouts')
                    .insert(layout as any)
                    .select()
                if (error) {
                    console.error('Error creating layout:', error)
                } else {
                    console.log('Created layout:', data[0])
                }
            }
        }

        // 4. Create sample trips
        const { data: routeData } = await supabase.from('routes').select('id, origin, destination')
        const { data: layoutData } = await supabase.from('seat_layouts').select('id')

        if (routeData && routeData.length > 0 && busData && busData.length > 0) {
            const routeDataTyped = routeData as any[]
            const pToGoaRoute = routeDataTyped.find((route) => route.origin === 'Pune' && route.destination === 'Goa')
            const firstRoute = routeDataTyped[0]

            const trips = [
                {
                    route_id: firstRoute.id,
                    bus_id: busDataTyped[0].id,
                    departure_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                    arrival_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours later
                    base_price: 450,
                    status: 'scheduled',
                    available_seats: 35,
                    total_seats: 40
                },
                {
                    route_id: routeDataTyped[1]?.id || firstRoute.id,
                    bus_id: busDataTyped[1]?.id || busDataTyped[0].id,
                    departure_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
                    arrival_time: new Date(Date.now() + 48 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
                    base_price: 380,
                    status: 'scheduled',
                    available_seats: 45,
                    total_seats: 50
                },
                {
                    route_id: pToGoaRoute?.id || firstRoute.id,
                    bus_id: busDataTyped[0].id,
                    departure_time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days later
                    arrival_time: new Date(Date.now() + 72 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // 9 hours later
                    base_price: 600,
                    status: 'scheduled',
                    available_seats: 40,
                    total_seats: 40
                }
            ]

            console.log('Creating trips...')
            for (const trip of trips) {
                const { data, error } = await supabase
                    .from('trips')
                    .insert(trip as any)
                    .select()
                if (error) {
                    console.error('Error creating trip:', error)
                } else {
                    console.log('Created trip:', data[0])
                }
            }
        }

        console.log('Database seeding completed!')
    } catch (error) {
        console.error('Error seeding database:', error)
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    (window as any).seedDatabase = seedDatabase
}