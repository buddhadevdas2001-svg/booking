import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xboqpqltsohakwbhrkgz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3FwcWx0c29oYWt3Ymhya2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjQyMywiZXhwIjoyMDkwNTA4NDIzfQ.hxJjVdkL5gHVmVmiZnqzdMqLwEQq7CJvcAOGB4fN-Lk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    let query = supabase
        .from('bookings')
        .select(`
            *,
            trip:trips(
                *,
                route:routes(*),
                bus:buses(*)
            ),
            booking_seats(*)
        `)
        .eq('booking_reference', 'BK2B176ECD')
        .limit(1);

    const { data, error } = await query;
    if (error) {
        console.error('Error:', error);
    } else {
        fs.writeFileSync('target_booking.json', JSON.stringify(data, null, 2));
    }
}
check();
