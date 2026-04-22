import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTrips() {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('id, available_seats, total_seats, route:routes(origin,destination)')
    .limit(10)
  
  if (error) {
    console.error(error)
    return
  }

  console.log('Trips Data:')
  console.table(trips.map(t => ({
    id: t.id,
    origin: t.route.origin,
    destination: t.route.destination,
    available: t.available_seats,
    total: t.total_seats
  })))

  const { data: bookings, error: bError } = await supabase
    .from('bookings')
    .select('id, trip_id, status')
  
  if (bError) {
    console.error(bError)
    return
  }

  console.log('\nBookings Count per Trip:')
  const counts = bookings.reduce((acc, b) => {
    acc[b.trip_id] = (acc[b.trip_id] || 0) + 1
    return acc
  }, {})
  console.table(counts)
}

checkTrips()
