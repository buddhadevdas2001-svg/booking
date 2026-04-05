const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function run() {
    const { data: trip } = await supabase.from('trips').select('id').limit(1).single();
    const { data: user } = await supabase.from('profiles').select('id').limit(1).single();

    const { data, error } = await supabase
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

    console.log('Result:', data);
    console.error('Error:', error);
}

run();
