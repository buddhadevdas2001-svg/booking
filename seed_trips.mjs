import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('Fetching existing routes and buses...')
    let { data: routes } = await supabase.from('routes').select('*');
    const { data: buses } = await supabase.from('buses').select('*');

    if (!buses || buses.length === 0) {
        console.error('No buses found. Please create at least one bus first.');
        return;
    }


    const hasDighaPuri = routes?.some(r => r.origin.toLowerCase() === 'digha' && r.destination.toLowerCase() === 'puri');
    if (!hasDighaPuri) {
        console.log('Adding Digha to Puri route...');
        const { data: newRoute, error: routeError } = await supabase.from('routes').insert({
            origin: 'Digha',
            destination: 'Puri',
            distance_km: 350,
            estimated_duration_minutes: 420,
            is_active: true
        }).select().single();

        if (routeError) {
            console.error('Error adding Digha -> Puri route:', routeError);
        } else if (newRoute) {
            routes.push(newRoute);
            console.log('Added Digha -> Puri route successfully.');
        }
    }


    const hasKolkataDigha = routes?.some(r => r.origin.toLowerCase() === 'kolkata' && r.destination.toLowerCase() === 'digha');
    if (!hasKolkataDigha) {
        const { data: newRoute } = await supabase.from('routes').insert({
            origin: 'Kolkata', destination: 'Digha', distance_km: 180, estimated_duration_minutes: 240, is_active: true
        }).select().single();
        if (newRoute) routes.push(newRoute);
    }

    const hasKolkataPuri = routes?.some(r => r.origin.toLowerCase() === 'kolkata' && r.destination.toLowerCase() === 'puri');
    if (!hasKolkataPuri) {
        const { data: newRoute } = await supabase.from('routes').insert({
            origin: 'Kolkata', destination: 'Puri', distance_km: 500, estimated_duration_minutes: 600, is_active: true
        }).select().single();
        if (newRoute) routes.push(newRoute);
    }

    const hasDurgapurDigha = routes?.some(r => r.origin.toLowerCase() === 'durgapur' && r.destination.toLowerCase() === 'digha');
    if (!hasDurgapurDigha) {
        const { data: newRoute } = await supabase.from('routes').insert({
            origin: 'Durgapur', destination: 'Digha', distance_km: 250, estimated_duration_minutes: 360, is_active: true
        }).select().single();
        if (newRoute) routes.push(newRoute);
    }

    console.log(`Ready to generate trips for ${routes?.length} routes using ${buses.length} buses.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newTripsCount = 0;
    const daysToSeed = 30;
    const tripsPerDay = 8;
    const intervalHours = 24 / tripsPerDay; // 3 hours

    for (let i = 0; i < daysToSeed; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        const dailyTrips = [];

        for (let rIdx = 0; rIdx < routes.length; rIdx++) {
            const route = routes[rIdx];

            for (let tIdx = 0; tIdx < tripsPerDay; tIdx++) {
                const depTime = new Date(targetDate);
                depTime.setHours(tIdx * intervalHours, 0, 0, 0);

                if (depTime < new Date()) continue;

                const bus = buses[(rIdx * tripsPerDay + tIdx) % buses.length];
                const duration = route.estimated_duration_minutes || 120;
                const arrTime = new Date(depTime);
                arrTime.setMinutes(depTime.getMinutes() + duration);

                // Base price variation
                let basePrice = 500;
                if (route.origin === 'Digha' && route.destination === 'Puri') basePrice = 850;
                else if (route.origin === 'Kolkata' && route.destination === 'Puri') basePrice = 950;
                else if (route.origin === 'Durgapur' && route.destination === 'Digha') basePrice = 650;
                else if (route.origin === 'Kolkata') basePrice = 450;

                const hour = depTime.getHours();
                if (hour < 6 || hour > 21) basePrice -= 100;

                dailyTrips.push({
                    route_id: route.id,
                    bus_id: bus.id,
                    departure_time: depTime.toISOString(),
                    arrival_time: arrTime.toISOString(),
                    base_price: basePrice,
                    status: 'scheduled',
                    available_seats: bus.capacity || bus.total_seats || 40
                });
            }
        }

        if (dailyTrips.length > 0) {
            console.log(`Checking existing trips for day ${i + 1}...`);
            
            const startOfDay = new Date(targetDate).toISOString();
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            const { data: existingTrips } = await supabase
                .from('trips')
                .select('route_id, departure_time')
                .gte('departure_time', startOfDay)
                .lte('departure_time', endOfDay.toISOString());

            const existingMap = new Set(
                (existingTrips || []).map(t => `${t.route_id}_${t.departure_time}`)
            );

            const tripsToInsert = dailyTrips.filter(t => 
                !existingMap.has(`${t.route_id}_${t.departure_time}`)
            );

            if (tripsToInsert.length > 0) {
                console.log(`Inserting ${tripsToInsert.length} new trips for day ${i + 1}...`);
                const { error } = await supabase.from('trips').insert(tripsToInsert);

                if (!error) {
                    newTripsCount += tripsToInsert.length;
                } else {
                    console.error(`Error in insert for day ${i + 1}:`, error.message);
                }
            } else {
                console.log(`All trips for day ${i + 1} already exist.`);
            }
        }
    }

    console.log(`Successfully seeded ${newTripsCount} new trips across ${daysToSeed} days!`);
}

seed()
