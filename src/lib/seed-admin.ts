import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

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

async function getOrCreateRoutes(supabase: SupabaseClient, routes: SeedRoute[]) {
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

async function getOrCreateBuses(supabase: SupabaseClient, buses: SeedBus[]) {
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

async function seedLayouts(supabase: SupabaseClient, busRows: Array<{ id: string; name: string }>) {
  for (const bus of busRows) {
    const isSleeper = bus.name.toLowerCase().includes('sleeper')
    const templateName = isSleeper ? 'Sleeper 2x1 Dual Deck Template' : 'Seater 2x2 Template'
    const seats = isSleeper ? buildSleeperLayout(10) : buildSeaterLayout(14, 4)

    const { data: existingLayout } = await supabase
      .from('seat_layouts')
      .select('id')
      .eq('bus_id', bus.id)
      .eq('name', templateName)
      .limit(1)

    if (existingLayout && existingLayout.length > 0) continue

    await supabase.from('seat_layouts').insert({
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
  }
}

async function seedTrips(
  supabase: SupabaseClient,
  routeIds: Map<string, string>,
  busRows: Array<{ id: string; name: string; total_seats: number }>
) {
  const plannedTrips = [
    { key: 'Kolkata-Siliguri', busName: 'Scania Premium AC Sleeper', departureOffsetHrs: 18, basePrice: 1499 },
    { key: 'Kolkata-Digha', busName: 'Volvo B11R AC Seater', departureOffsetHrs: 12, basePrice: 699 },
    { key: 'Kolkata-Darjeeling', busName: 'Mercedes SHD Lux Sleeper', departureOffsetHrs: 30, basePrice: 1699 },
    { key: 'Siliguri-Kolkata', busName: 'Ashok Leyland JanBus', departureOffsetHrs: 26, basePrice: 999 },
    { key: 'Kolkata-Mandarmani', busName: 'Volvo B11R AC Seater', departureOffsetHrs: 9, basePrice: 749 },
  ]

  for (const planned of plannedTrips) {
    const routeId = routeIds.get(planned.key)
    const bus = busRows.find((b) => b.name === planned.busName) || busRows[0]
    if (!routeId || !bus) continue

    const departure = new Date(Date.now() + planned.departureOffsetHrs * 60 * 60 * 1000)
    const arrival = new Date(departure.getTime() + 7 * 60 * 60 * 1000)

    const { data: existing } = await supabase
      .from('trips')
      .select('id')
      .eq('route_id', routeId)
      .eq('bus_id', bus.id)
      .gte('departure_time', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
      .limit(1)

    if (existing && existing.length > 0) continue

    await supabase.from('trips').insert({
      route_id: routeId,
      bus_id: bus.id,
      departure_time: departure.toISOString(),
      arrival_time: arrival.toISOString(),
      base_price: planned.basePrice,
      available_seats: bus.total_seats,
      total_seats: bus.total_seats,
      status: 'scheduled',
      boarding_points: [{ name: 'Main Terminal', time: departure.toISOString() }],
      dropping_points: [{ name: 'Final Stop', time: arrival.toISOString() }],
    } as never)
  }
}

export async function seedDatabase(client?: SupabaseClient) {
  // Use provided client, or try to create admin client, or fallback to server client
  let supabase: SupabaseClient
  if (client) {
    supabase = client
  } else {
    try {
      supabase = createAdminClient()
    } catch {
      supabase = await createServerClient()
    }
  }

  try {
    const routes: SeedRoute[] = [
      { origin: 'Kolkata', destination: 'Siliguri', origin_code: 'CCU', destination_code: 'IXB', distance_km: 580, estimated_duration_minutes: 720, stops: [] },
      { origin: 'Kolkata', destination: 'Digha', origin_code: 'CCU', destination_code: 'DIG', distance_km: 180, estimated_duration_minutes: 240, stops: [] },
      { origin: 'Kolkata', destination: 'Darjeeling', origin_code: 'CCU', destination_code: 'IXB', distance_km: 630, estimated_duration_minutes: 840, stops: [] },
      { origin: 'Siliguri', destination: 'Kolkata', origin_code: 'IXB', destination_code: 'CCU', distance_km: 580, estimated_duration_minutes: 720, stops: [] },
      { origin: 'Kolkata', destination: 'Mandarmani', origin_code: 'CCU', destination_code: 'MMN', distance_km: 170, estimated_duration_minutes: 240, stops: [] },
      { origin: 'Pune', destination: 'Goa', origin_code: 'PNQ', destination_code: 'GOI', distance_km: 450, estimated_duration_minutes: 600, stops: [] },
    ]

    const buses: SeedBus[] = [
      { name: 'Scania Premium AC Sleeper', registration_number: 'WB-01-A-1234', bus_type: 'AC Sleeper', total_seats: 40, amenities: ['AC', 'WiFi', 'Charging Point'], features: { ac: true, sleeper: true, wifi: true } },
      { name: 'Volvo B11R AC Seater', registration_number: 'WB-01-B-5678', bus_type: 'AC Seater', total_seats: 55, amenities: ['AC', 'WiFi'], features: { ac: true, seater: true } },
      { name: 'Mercedes SHD Lux Sleeper', registration_number: 'WB-01-C-9012', bus_type: 'AC Sleeper', total_seats: 36, amenities: ['AC', 'WiFi', 'Blanket'], features: { ac: true, sleeper: true } },
      { name: 'Ashok Leyland JanBus', registration_number: 'WB-01-D-3456', bus_type: 'Non-AC Seater', total_seats: 50, amenities: [], features: { ac: false, seater: true } },
    ]

    const routeIds = await getOrCreateRoutes(supabase, routes)
    const busRows = await getOrCreateBuses(supabase, buses)
    await seedLayouts(supabase, busRows)
    await seedTrips(supabase, routeIds, busRows)

    return { success: true }
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  }
}
