
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xboqpqltsohakwbhrkgz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3FwcWx0c29oYWt3Ymhya2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjQyMywiZXhwIjoyMDkwNTA4NDIzfQ.hxJjVdkL5gHVmVmiZnqzdMqLwEQq7CJvcAOGB4fN-Lk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixEverything() {
    console.log('--- Fixing Supabase Access for buddhadev1508@gmail.com ---')

    // 1. Find the user
    const targetEmail = 'buddhadev1508@gmail.com'
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
        console.error('Error listing users:', listError.message)
        return
    }

    const user = users.find(u => u.email === targetEmail)
    if (!user) {
        console.error(`User ${targetEmail} not found!`)
        return
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`)

    // 2. Ensure profile exists and set as admin
    console.log('Syncing profile and promoting to admin...')
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Buddhadev',
            role: 'admin',
            updated_at: new Date().toISOString()
        })
    
    if (profileError) {
        console.error('Error updating profile:', profileError.message)
    } else {
        console.log('Profile updated to ADMIN successfully.')
    }

    // 3. Update Auth Metadata as well (for good measure)
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'admin' } }
    )
    
    if (authUpdateError) {
        console.error('Error updating auth metadata:', authUpdateError.message)
    } else {
        console.log('Auth metadata updated to ADMIN successfully.')
    }

    // 4. Run seeding if database is empty
    console.log('Triggering database seed...')
    // We'll call the project's own seed logic if possible, or just log that it should be done from UI.
    console.log('Please refresh the Admin Dashboard and click "Seed Database" now.')
}

fixEverything()
