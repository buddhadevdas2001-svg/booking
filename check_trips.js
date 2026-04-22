require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('trips')
    .select('departure_time, available_seats, total_seats, bus:buses(total_seats)');

  if (error) {
    console.error(error);
    return;
  }

  console.log("Upcoming Trips Data:");
  data.forEach((t, i) => {
    console.log(`Trip ${i+1}: Dep=${t.departure_time}, Available=${t.available_seats}, Total=${t.total_seats}, BusTotal=${t.bus?.total_seats}`);
  });
}

check();
