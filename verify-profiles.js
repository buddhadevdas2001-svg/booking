const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: users } = await supabase.auth.admin.listUsers();
    console.log(`Total Auth Users:`, users?.users?.length);
    
    const { data: profiles } = await supabase.from('profiles').select('id');
    console.log(`Total Profiles:`, profiles?.length);

    if (users && profiles) {
       const missing = users.users.filter(u => !profiles.find(p => p.id === u.id));
       console.log(`Missing Profiles for Auth Users:`, missing.length);
       if(missing.length > 0) {
           console.log(`First missing user ID:`, missing[0].id);
       }
    }
}
check();
