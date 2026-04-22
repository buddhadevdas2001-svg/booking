import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDb() {
    const { data: routes } = await supabase.from('routes').select('*');
    const { data: buses } = await supabase.from('buses').select('*');
    const { data: trips } = await supabase.from('trips').select('*').limit(5);
    
    console.log(`Found ${routes?.length || 0} routes.`);
    console.log(`Found ${buses?.length || 0} buses.`);
    console.log(`Found ${trips?.length || 0} trips.`);
    
    if (routes?.length && buses?.length) {
       console.log('Sample Route:', routes[0]);
       console.log('Sample Bus:', buses[0]);
    }
}

checkDb()
