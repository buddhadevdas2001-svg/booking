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

    console.log(`Ready to generate trips for ${routes?.length} routes using ${buses.length} buses.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newTripsCount = 0;

    for (let i = 0; i < 30; i++) {

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);


        for (let j = 0; j < routes.length; j++) {
            const route = routes[j];

            const bus = buses[j % buses.length];


            const depTime = new Date(targetDate);
            depTime.setHours(10, 0, 0, 0);

            const duration = route.estimated_duration_minutes || 120;
            const arrTime = new Date(depTime);
            arrTime.setMinutes(depTime.getMinutes() + duration);

            const { data: existing } = await supabase
                .from('trips')
                .select('id')
                .eq('route_id', route.id)
                .eq('bus_id', bus.id)
                .eq('departure_time', depTime.toISOString());

            if (!existing || existing.length === 0) {

                const { error } = await supabase.from('trips').insert({
                    route_id: route.id,
                    bus_id: bus.id,
                    departure_time: depTime.toISOString(),
                    arrival_time: arrTime.toISOString(),
                    base_price: route.origin === 'Digha' ? 600 : (route.origin === 'Kolkata' ? 350 : 500),
                    status: 'scheduled',
                    available_seats: bus.capacity || bus.total_seats || 40
                });

                if (!error) {
                    newTripsCount++;
                } else {
                    console.error('Error inserting trip:', error)
                }
            }
        }
    }

    console.log(`Successfully seeded ${newTripsCount} new daily trips for the next 30 days!`);
}

seed()
