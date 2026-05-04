
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xboqpqltsohakwbhrkgz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3FwcWx0c29oYWt3Ymhya2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjQyMywiZXhwIjoyMDkwNTA4NDIzfQ.hxJjVdkL5gHVmVmiZnqzdMqLwEQq7CJvcAOGB4fN-Lk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabase() {
    console.log('--- Supabase Connection Check ---')
    
    const tables = ['profiles', 'buses', 'routes', 'trips', 'bookings']
    
    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
            
            if (error) {
                console.error(`Error checking table "${table}":`, error.message)
            } else {
                console.log(`Table "${table}": ${count} records`)
            }
        } catch (e) {
            console.error(`Unexpected error for table "${table}":`, e.message)
        }
    }

    // Check for admin users
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
        console.error('Error listing auth users:', userError.message)
    } else {
        console.log('Total Auth Users found:', users?.length || 0)
        users?.forEach(u => {
            console.log(` - Email: ${u.email} | ID: ${u.id} | Metadata:`, JSON.stringify(u.user_metadata))
        })
    }
}

checkSupabase()
