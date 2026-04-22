import { createAdminClient as createClient } from '@/lib/supabase/admin'

const supabase = createClient()

type SeedRoute = {
  origin: string
  destination: string
  origin_code: string
  destination_code: string
  distance_km: number
  estimated_duration_minutes: number
  stops: Array<{ name: string; eta_offset_minutes: number }>
}

type SeedBus = {
  name: string
  registration_number: string
  bus_type: string
  total_seats: number
  amenities: string[]
  features: Record<string, boolean>
}

type SeedSeat = {
  id: string
  label: string
  type: 'seater' | 'sleeper' | 'driver' | 'empty'
  row: number
  col: number
  deck: 'lower' | 'upper'
  price_multiplier: number
}

function buildSeaterLayout(rows: number, cols: number): SeedSeat[] {
  const seats: SeedSeat[] = []
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (col === 2) continue
      const label = `${rowLabels[row]}${col < 2 ? col + 1 : col}`
      seats.push({
        id: label,
        label,
        type: 'seater',
        row,
        col,
        deck: 'lower',
        price_multiplier: row < 2 ? 1.15 : 1,
      })
    }
  }
  seats.push({
    id: 'DRV',
    label: 'DRV',
    type: 'driver',
    row: rows - 1,
    col: cols - 1,
    deck: 'lower',
    price_multiplier: 0,
  })
  return seats
}

function buildSleeperLayout(rowsPerDeck: number): SeedSeat[] {
  const seats: SeedSeat[] = []
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  ;(['lower', 'upper'] as const).forEach((deck) => {
    for (let row = 0; row < rowsPerDeck; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        if (col === 1) continue
        const label = `${deck === 'upper' ? 'U' : 'L'}${rowLabels[row]}${col === 0 ? '1' : '2'}`
        seats.push({
          id: label,
          label,
          type: 'sleeper',
          row,
          col,
          deck,
          price_multiplier: deck === 'upper' ? 1.08 : 1.03,
        })
      }
    }
  })
  seats.push({
    id: 'DRV',
    label: 'DRV',
    type: 'driver',
    row: rowsPerDeck - 1,
    col: 2,
    deck: 'lower',
    price_multiplier: 0,
  })
  return seats
}

async function getOrCreateRoutes(routes: SeedRoute[]) {
  const { data: existingRoutes, error: routeFetchError } = await supabase
    .from('routes')
    .select('id, origin, destination')

  if (routeFetchError) throw routeFetchError

  const typedExistingRoutes = (existingRoutes || []) as Array<{ id: string; origin: string; destination: string }>
  const existingRouteMap = new Map(
    typedExistingRoutes.map((route: { id: string; origin: string; destination: string }) => [`${route.origin}-${route.destination}`, route.id])
  )

  const routeIds = new Map<string, string>()
  for (const route of routes) {
    const key = `${route.origin}-${route.destination}`
    const existingId = existingRouteMap.get(key)
    if (existingId) {
      routeIds.set(key, existingId)
      continue
    }

    const { data: inserted, error } = await supabase.from('routes').insert({
      ...route,
      is_active: true,
    } as never).select('id').single()

    if (error) throw error
    routeIds.set(key, (inserted as { id: string }).id)
  }

  return routeIds
}

async function getOrCreateBuses(buses: SeedBus[]) {
  const { error } = await supabase.from('buses').upsert(
    buses.map((bus) => ({ ...bus, is_active: true })) as never,
    { onConflict: 'registration_number' }
  )
  if (error) throw error

  const { data: busRows, error: busReadError } = await supabase
    .from('buses')
    .select('id, name, registration_number, total_seats')
    .in('registration_number', buses.map((bus) => bus.registration_number))

  if (busReadError) throw busReadError

  return (busRows || []) as Array<{ id: string; name: string; registration_number: string; total_seats: number }>
}

async function seedLayouts(busRows: Array<{ id: string; name: string }>) {
  for (const bus of busRows) {
    const isSleeper = bus.name.toLowerCase().includes('sleeper')
    const templateName = isSleeper ? 'Sleeper 2x1 Dual Deck Template' : 'Seater 2x2 Template'
    const seats = isSleeper ? buildSleeperLayout(10) : buildSeaterLayout(14, 4)

    const { data: existingLayout, error: layoutLookupError } = await supabase
      .from('seat_layouts')
      .select('id')
      .eq('bus_id', bus.id)
      .eq('name', templateName)
      .limit(1)

    if (layoutLookupError) throw layoutLookupError
    if (existingLayout && existingLayout.length > 0) continue

    const { error: layoutInsertError } = await supabase.from('seat_layouts').insert({
      bus_id: bus.id,
      name: templateName,
      layout_data: {
        rows: isSleeper ? 10 : 14,
        cols: isSleeper ? 3 : 4,
        seats,
        hasUpperDeck: isSleeper,
      },
      is_template: true,
      is_active: true,
    } as never)

    if (layoutInsertError) throw layoutInsertError
  }
}

async function seedTrips(
  routeIds: Map<string, string>,
  busRows: Array<{ id: string; name: string; total_seats: number }>
) {
  const plannedTrips = [
    { key: 'Kolkata-Siliguri', busName: 'Scania Premium AC Sleeper', departureOffsetHrs: 18, basePrice: 1499 },
    { key: 'Kolkata-Digha', busName: 'Volvo B11R AC Seater', departureOffsetHrs: 12, basePrice: 699 },
    { key: 'Kolkata-Darjeeling', busName: 'Mercedes SHD Lux Sleeper', departureOffsetHrs: 30, basePrice: 1699 },
    { key: 'Siliguri-Kolkata', busName: 'Ashok Leyland JanBus', departureOffsetHrs: 26, basePrice: 999 },
    { key: 'Kolkata-Mandarmani', busName: 'Volvo B11R AC Seater', departureOffsetHrs: 9, basePrice: 749 },
    { key: 'Pune-Goa', busName: 'Scania Premium AC Sleeper', departureOffsetHrs: 40, basePrice: 1299 },
  ]

  for (const planned of plannedTrips) {
    const routeId = routeIds.get(planned.key)
    const bus = busRows.find((b) => b.name === planned.busName) || busRows[0]
    if (!routeId || !bus) continue

    const departure = new Date(Date.now() + planned.departureOffsetHrs * 60 * 60 * 1000)
    const arrival = new Date(departure.getTime() + 7 * 60 * 60 * 1000)

    const { data: existing, error: existingError } = await supabase
      .from('trips')
      .select('id')
      .eq('route_id', routeId)
      .eq('bus_id', bus.id)
      .gte('departure_time', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
      .limit(1)

    if (existingError) throw existingError
    if (existing && existing.length > 0) continue

    const { error: tripInsertError } = await supabase.from('trips').insert({
      route_id: routeId,
      bus_id: bus.id,
      departure_time: departure.toISOString(),
      arrival_time: arrival.toISOString(),
      base_price: planned.basePrice,
      available_seats: bus.total_seats,
      total_seats: bus.total_seats,
      status: 'scheduled',
      boarding_points: [
        { name: 'Main Bus Terminal', time: departure.toISOString() },
        { name: 'Bypass Pickup', time: new Date(departure.getTime() + 30 * 60 * 1000).toISOString() },
      ],
      dropping_points: [
        { name: 'Central Stop', time: new Date(arrival.getTime() - 45 * 60 * 1000).toISOString() },
        { name: 'Final Terminal', time: arrival.toISOString() },
      ],
      dynamic_pricing_config: {
        peak_hour_factor: 1.2,
        last_minute_factor: 1.35,
        early_bird_factor: 0.88,
        max_demand_factor: 1.6,
        min_price: 250,
        max_price: 6000,
      },
    } as never)

    if (tripInsertError) throw tripInsertError
  }
}

async function seedOffersAndCoupons() {
  const coupons = [
    {
      code: 'FIRST50',
      description: 'First booking 50% off up to ₹300',
      discount_type: 'percentage',
      discount_value: 50,
      max_discount_amount: 300,
      min_purchase_amount: 500,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 2000,
      is_active: true,
    },
    {
      code: 'WEEKEND200',
      description: 'Flat ₹200 off on weekend routes',
      discount_type: 'fixed',
      discount_value: 200,
      min_purchase_amount: 1000,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 3000,
      is_active: true,
    },
    {
      code: 'EARLYBIRD15',
      description: '15% off for advance booking',
      discount_type: 'percentage',
      discount_value: 15,
      min_purchase_amount: 800,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 10000,
      is_active: true,
    },
  ]

  const { error: couponError } = await supabase.from('coupons').upsert(coupons as never, { onConflict: 'code' })
  if (couponError) throw couponError

  const offers = [
    {
      code: 'FLASHMON',
      title: 'Monday Flash Sale',
      description: 'Extra savings for Monday departures',
      discount_type: 'percentage',
      discount_value: 10,
      min_booking_amount: 600,
      max_discount_amount: 250,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    },
    {
      code: 'NIGHTRIDE',
      title: 'Night Ride Discount',
      description: 'Special fare for late-night AC buses',
      discount_type: 'fixed',
      discount_value: 150,
      min_booking_amount: 900,
      max_discount_amount: 150,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    },
  ]

  const { error: offersError } = await supabase.from('offers').upsert(offers as never, { onConflict: 'code' })
  if (offersError) {
    console.warn('Offers seeding skipped:', offersError.message)
  }
}

async function seedStaffAndAssignments() {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .limit(6)

  if (profileError) throw profileError
  const typedProfiles = (profiles || []) as Array<{ id: string; full_name: string }>
  if (typedProfiles.length === 0) {
    console.log('No profiles found for staff assignment. Skipping staff seed.')
    return
  }

  const staffRows = typedProfiles.slice(0, 4).map((profile: { id: string; full_name: string }, index: number) => {
    const isDriver = index % 2 === 0
    return {
      user_id: profile.id,
      staff_type: isDriver ? 'driver' : 'conductor',
      employee_id: `EMP-${(index + 1).toString().padStart(3, '0')}`,
      license_number: isDriver ? `DL-${1000 + index}` : null,
      experience_years: isDriver ? 5 + index : 2 + index,
      joining_date: new Date(Date.now() - (300 + index * 90) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      salary: isDriver ? 42000 + index * 2500 : 26000 + index * 1500,
      shift_timing: isDriver ? { from: '19:00', to: '07:00' } : { from: '18:00', to: '06:00' },
      emergency_contact: { name: 'Emergency Contact', phone: `+919000000${index}` },
      is_active: true,
    }
  })

  const { error: staffUpsertError } = await supabase.from('staff').upsert(staffRows as never, { onConflict: 'employee_id' })
  if (staffUpsertError) throw staffUpsertError

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id')
    .gte('departure_time', new Date().toISOString())
    .order('departure_time', { ascending: true })
    .limit(6)
  if (tripsError) throw tripsError

  const { data: staff, error: staffError } = await supabase.from('staff').select('id, staff_type').limit(10)
  if (staffError) throw staffError

  const typedStaff = (staff || []) as Array<{ id: string; staff_type: string }>
  if (!trips || trips.length === 0 || typedStaff.length === 0) return

  for (const trip of trips) {
    const driver = typedStaff.find((member: { id: string; staff_type: string }) => member.staff_type === 'driver')
    const conductor = typedStaff.find((member: { id: string; staff_type: string }) => member.staff_type === 'conductor')
    const assignments = [driver, conductor].filter(Boolean).map((member: { id: string; staff_type: string } | undefined) => ({
      trip_id: trip.id,
      staff_id: member!.id,
      role: member!.staff_type,
      attendance_status: 'pending',
    }))

    if (assignments.length === 0) continue

    const { error: assignError } = await supabase.from('trip_staff').upsert(assignments as never, {
      onConflict: 'trip_id,staff_id',
      ignoreDuplicates: true,
    })
    if (assignError) {
      console.warn(`Trip staff assignment skipped for trip ${trip.id}:`, assignError.message)
    }
  }
}

async function seedSampleBookings() {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(2)
  if (profileError) throw profileError

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id, base_price, departure_time')
    .gte('departure_time', new Date().toISOString())
    .order('departure_time', { ascending: true })
    .limit(2)
  if (tripsError) throw tripsError

  if (!profiles || profiles.length === 0 || !trips || trips.length === 0) {
    console.log('Skipping sample bookings: missing profiles or trips.')
    return
  }

  for (let index = 0; index < Math.min(profiles.length, trips.length); index += 1) {
    const profile = profiles[index]
    const trip = trips[index]
    const seatLabel = `A${index + 1}`
    const amount = Number(trip.base_price || 700)

    const { data: existing, error: existingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', profile.id)
      .eq('trip_id', trip.id)
      .limit(1)
    if (existingError) throw existingError
    if (existing && existing.length > 0) continue

    const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
      user_id: profile.id,
      trip_id: trip.id,
      total_amount: amount,
      discount_amount: 0,
      final_amount: amount,
      status: 'confirmed',
      payment_status: 'succeeded',
      passenger_details: [{ name: `Passenger ${index + 1}`, age: 29 + index, gender: 'M' }],
      contact_email: `demo${index + 1}@example.com`,
      contact_phone: `90000000${index + 1}`,
    } as never).select('id').single()

    if (bookingError) throw bookingError

    const { error: seatError } = await supabase.from('booking_seats').insert({
      booking_id: booking.id,
      seat_label: seatLabel,
      passenger_name: `Passenger ${index + 1}`,
      passenger_age: 29 + index,
      passenger_gender: 'M',
      price: amount,
      status: 'confirmed',
    } as never)
    if (seatError) throw seatError

    // Decrement available seats in trip
    const { data: tripData } = await supabase.from('trips').select('available_seats').eq('id', trip.id).single()
    if (tripData) {
      await supabase.from('trips').update({
        available_seats: Math.max(0, (tripData.available_seats || 0) - 1)
      } as never).eq('id', trip.id)
    }
  }
}

export async function seedDatabase() {
  try {
    console.log('Starting scope-aligned database seeding...')

    const routes: SeedRoute[] = [
      {
        origin: 'Kolkata',
        destination: 'Siliguri',
        origin_code: 'CCU',
        destination_code: 'IXB',
        distance_km: 580,
        estimated_duration_minutes: 720,
        stops: [
          { name: 'Krishnanagar', eta_offset_minutes: 150 },
          { name: 'Malda', eta_offset_minutes: 360 },
        ],
      },
      {
        origin: 'Kolkata',
        destination: 'Digha',
        origin_code: 'CCU',
        destination_code: 'DIG',
        distance_km: 180,
        estimated_duration_minutes: 240,
        stops: [{ name: 'Kolaghat', eta_offset_minutes: 80 }],
      },
      {
        origin: 'Kolkata',
        destination: 'Darjeeling',
        origin_code: 'CCU',
        destination_code: 'DAJ',
        distance_km: 620,
        estimated_duration_minutes: 840,
        stops: [
          { name: 'Bardhaman', eta_offset_minutes: 110 },
          { name: 'Siliguri', eta_offset_minutes: 640 },
        ],
      },
      {
        origin: 'Siliguri',
        destination: 'Kolkata',
        origin_code: 'IXB',
        destination_code: 'CCU',
        distance_km: 580,
        estimated_duration_minutes: 700,
        stops: [{ name: 'Malda', eta_offset_minutes: 290 }],
      },
      {
        origin: 'Kolkata',
        destination: 'Mandarmani',
        origin_code: 'CCU',
        destination_code: 'MDM',
        distance_km: 170,
        estimated_duration_minutes: 210,
        stops: [{ name: 'Nandakumar', eta_offset_minutes: 110 }],
      },
      {
        origin: 'Pune',
        destination: 'Goa',
        origin_code: 'PNQ',
        destination_code: 'GOI',
        distance_km: 450,
        estimated_duration_minutes: 600,
        stops: [
          { name: 'Satara', eta_offset_minutes: 130 },
          { name: 'Kolhapur', eta_offset_minutes: 260 },
        ],
      },
    ]

    const buses: SeedBus[] = [
      {
        name: 'Scania Premium AC Sleeper',
        registration_number: 'WB-01-A-1234',
        bus_type: 'AC Sleeper',
        total_seats: 40,
        amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'CCTV'],
        features: {
          ac: true,
          wifi: true,
          charging_point: true,
          entertainment: true,
          washroom: true,
          water_bottle: true,
        },
      },
      {
        name: 'Volvo B11R AC Seater',
        registration_number: 'WB-01-B-5678',
        bus_type: 'AC Seater',
        total_seats: 55,
        amenities: ['AC', 'WiFi', 'Charging', 'Water Bottle'],
        features: {
          ac: true,
          wifi: true,
          charging_point: true,
          entertainment: false,
          washroom: false,
          water_bottle: true,
        },
      },
      {
        name: 'Ashok Leyland JanBus',
        registration_number: 'WB-01-C-9012',
        bus_type: 'Non-AC Seater',
        total_seats: 50,
        amenities: ['Pushback', 'Water Bottle'],
        features: {
          ac: false,
          wifi: false,
          charging_point: false,
          entertainment: false,
          washroom: false,
          water_bottle: true,
        },
      },
      {
        name: 'Mercedes SHD Lux Sleeper',
        registration_number: 'WB-02-D-3456',
        bus_type: 'AC Sleeper Lux',
        total_seats: 36,
        amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Privacy Curtain'],
        features: {
          ac: true,
          wifi: true,
          charging_point: true,
          entertainment: true,
          washroom: true,
          water_bottle: true,
        },
      },
    ]

    console.log('Seeding routes...')
    const routeIds = await getOrCreateRoutes(routes)

    console.log('Seeding buses...')
    const busRows = await getOrCreateBuses(buses)

    console.log('Seeding seat layouts...')
    await seedLayouts(busRows.map((bus: { id: string; name: string }) => ({ id: bus.id, name: bus.name })))

    console.log('Seeding trips...')
    await seedTrips(
      routeIds,
      busRows.map((bus: { id: string; name: string; total_seats: number }) => ({ id: bus.id, name: bus.name, total_seats: bus.total_seats }))
    )

    console.log('Seeding offers and coupons...')
    await seedOffersAndCoupons()

    console.log('Seeding staff and assignments...')
    await seedStaffAndAssignments()

    console.log('Seeding sample bookings...')
    await seedSampleBookings()

    console.log('Database seeding completed successfully.')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

declare global {
  interface Window {
    seedDatabase?: () => Promise<void>
  }
}

if (typeof window !== 'undefined') {
  window.seedDatabase = seedDatabase
}
