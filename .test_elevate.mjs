import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let env = {};
try {
    const raw = fs.readFileSync('.env.local', 'utf-8');
    raw.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let val = match[2];
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            env[match[1]] = val;
        }
    });
} catch(e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function elevate() {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) { console.error('Error fetching users:', error); return; }
    for (const u of users.users) {
        console.log('Elevating:', u.email);
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', u.id);
    }
    console.log('All profiles elevated to admin!');
}
elevate();
