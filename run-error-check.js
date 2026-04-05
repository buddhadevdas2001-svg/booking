const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    // Generate a dummy conflict to see what Supabase returns.
    const { data: trip } = await supabase.from('trips').select('id').limit(1).single();
    const { data: user } = await supabase.from('profiles').select('id').limit(1).single();

    if (!trip || !user) return console.error("No trip/user");

    // Insert once and get the ID
    const { data: b1, error: e1 } = await supabase.from('bookings').insert({
        user_id: user.id, trip_id: trip.id, total_amount: 100, final_amount: 100,
        passenger_details: {}, contact_email: 'a@a.com', contact_phone: '123'
    }).select().single();

    if (e1) return console.error('E1:', e1);

    // Try to insert again WITH THE SAME ID to intentionally cause 409
    const { data: b2, error: e2 } = await supabase.from('bookings').insert({
        id: b1.id,
        user_id: user.id, trip_id: trip.id, total_amount: 100, final_amount: 100,
        passenger_details: {}, contact_email: 'a@a.com', contact_phone: '123'
    }).select().single();

    console.log('E2 Error Code:', e2?.code);
    console.log('E2 Details:', e2?.details);
    console.log('E2 Message:', e2?.message);
}

run();
