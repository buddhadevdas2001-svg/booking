const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // using anon key to simulate client
);

async function run() {
    try {
        const { data: { user }, error: authErr } = await supabase.auth.signInWithPassword({
            email: 'test@example.com', // wait, do we have a user? Let's just use service role first.
            password: 'password123'
        });
    } catch(e) {}
    
    // We will use service_role again.
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: trip } = await adminSupabase.from('trips').select('id').limit(1).single();
    const { data: user } = await adminSupabase.from('profiles').select('id').limit(1).single();

    if(!trip || !user) {
        console.log("No trip or user");
        return;
    }

    const { data, error } = await adminSupabase
        .from('bookings')
        .insert({
            user_id: user.id,
            trip_id: trip.id,
            total_amount: 100,
            final_amount: 100,
            passenger_details: { "test": "test" },
            contact_email: 'test@example.com',
            contact_phone: '1234567890',
            status: 'pending',
            payment_status: 'pending'
        })
        .select()
        .single();

    console.log('Result:', JSON.stringify(data));
    console.log('Error:', JSON.stringify(error));
}

run().then(() => console.log('Done')).catch(console.error);
