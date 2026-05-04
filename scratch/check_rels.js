
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xboqpqltsohakwbhrkgz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3FwcWx0c29oYWt3Ymhya2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMjQyMywiZXhwIjoyMDkwNTA4NDIzfQ.hxJjVdkL5gHVmVmiZnqzdMqLwEQq7CJvcAOGB4fN-Lk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('--- Checking Database Relationships ---')
    
    // Check if we can get trips with routes
    const { data: tripsWithRoutes, error: err1 } = await supabase
        .from('trips')
        .select('id, route:routes(origin, destination)')
        .limit(1)
    
    if (err1) console.error('Error trips->routes:', err1.message)
    else console.log('Trips -> Routes sample:', JSON.stringify(tripsWithRoutes, null, 2))

    // Check if we can get routes with trips
    const { data: routesWithTrips, error: err2 } = await supabase
        .from('routes')
        .select('id, origin, trips(id)')
        .limit(1)
    
    if (err2) console.error('Error routes->trips:', err2.message)
    else console.log('Routes -> Trips sample:', JSON.stringify(routesWithTrips, null, 2))
}

check()
