
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xboqpqltsohakwbhrkgz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3FwcWx0c29oYWt3Ymhya2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjQyMywiZXhwIjoyMDkwNTA4NDIzfQ.hxJjVdkL5gHVmVmiZnqzdMqLwEQq7CJvcAOGB4fN-Lk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('--- Checking Routes and Trips ---')
    const { data, error } = await supabase
        .from('routes')
        .select('origin, destination, trips(id, base_price, departure_time)')
        .limit(5)
    
    if (error) {
        console.error('Error:', error.message)
        return
    }

    console.log('Results:', JSON.stringify(data, null, 2))
}

check()
