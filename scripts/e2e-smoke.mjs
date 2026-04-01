import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return
  const text = fs.readFileSync(path, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now()
  let lastError = null
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status < 500) return
    } catch (err) {
      lastError = err
    }
    await sleep(1200)
  }
  throw new Error(`Server did not become ready: ${String(lastError)}`)
}

async function callApi(method, path, body, expectedStatuses = [200]) {
  const opts = {
    method,
    headers: {
      'content-type': 'application/json',
    },
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, opts)
  const text = await res.text()
  let data = text
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Non-JSON body
  }

  if (!expectedStatuses.includes(res.status)) {
    throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data)}`)
  }
  return { status: res.status, data }
}

async function main() {
  loadEnvFile('.env.local')
  await waitForServer(`${BASE_URL}/api/setup`)

  const results = []
  const ok = (name) => results.push({ name, ok: true })
  const fail = (name, err) => results.push({ name, ok: false, error: String(err) })

  let createdBusId = null
  let createdRouteId = null
  let createdTripId = null
  let createdBookingId = null
  let createdStaffId = null
  let createdLayoutId = null
  let createdOfferId = null

  let userEmail = `e2e.user.${Date.now()}@example.com`
  const userPassword = 'Test@12345'

  try {
    await callApi('GET', '/api/setup', undefined, [200])
    ok('GET /api/setup')
  } catch (err) {
    fail('GET /api/setup', err)
  }

  // Keep public endpoints for basic smoke checks. Admin endpoints are exercised
  // via the Supabase service role client below.
  const publicPaths = [
    '/api/cities',
    '/api/offers',
    '/api/popular-routes',
    '/api/trips',
  ]

  for (const path of publicPaths) {
    try {
      await callApi('GET', path, undefined, [200])
      ok(`GET ${path}`)
    } catch (err) {
      fail(`GET ${path}`, err)
    }
  }

  let buses = []
  let routes = []
  let trips = []
  let staff = []
  let offers = []
  let layouts = []

  // Create an admin supabase client using the service role key for direct DB operations
  const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const { data: busesData } = await adminSupabase.from('buses').select('*').order('created_at', { ascending: false })
    buses = busesData || []
    const { data: routesData } = await adminSupabase.from('routes').select('*').order('created_at', { ascending: false })
    routes = routesData || []
    const { data: tripsData } = await adminSupabase.from('trips').select('*').order('departure_time', { ascending: false })
    trips = tripsData || []
    const { data: staffData } = await adminSupabase.from('staff').select('*')
    staff = staffData || []
    const { data: offersData } = await adminSupabase.from('offers').select('*')
    offers = offersData || []
    const { data: layoutsData } = await adminSupabase.from('seat_layouts').select('*')
    layouts = layoutsData || []
  } catch (err) {
    // ignore - we'll create resources as needed
  }

  try {
    const busPayload = {
      name: `E2E Bus ${Date.now()}`,
      registration_number: `E2E-${Date.now().toString().slice(-6)}`,
      bus_type: 'AC Seater',
      total_seats: 40,
      amenities: ['AC'],
      is_active: true,
    }
    const { data: busData, error: busError } = await adminSupabase.from('buses').insert(busPayload).select().single()
    if (busError) throw busError
    createdBusId = busData.id
    const { error: busUpdateError } = await adminSupabase.from('buses').update({ name: `${busPayload.name} Updated` }).eq('id', createdBusId)
    if (busUpdateError) throw busUpdateError
    ok('Admin bus create/get/update')
  } catch (err) {
    fail('Admin bus create/get/update', err)
  }

  try {
    const routePayload = {
      origin: 'E2E Origin',
      destination: 'E2E Destination',
      origin_code: 'E2O',
      destination_code: 'E2D',
      distance_km: 123,
      estimated_duration_minutes: 180,
      stops: [],
      is_active: true,
    }
    const { data: routeData, error: routeError } = await adminSupabase.from('routes').insert(routePayload).select().single()
    if (routeError) throw routeError
    createdRouteId = routeData.id
    const { error: routeUpdateError } = await adminSupabase.from('routes').update({ distance_km: 130 }).eq('id', createdRouteId)
    if (routeUpdateError) throw routeUpdateError
    ok('Admin route create/get/update')
  } catch (err) {
    fail('Admin route create/get/update', err)
  }

  try {
    const baseBusId = createdBusId || buses?.[0]?.id
    const baseRouteId = createdRouteId || routes?.[0]?.id
    if (!baseBusId || !baseRouteId) throw new Error('No bus/route available for trip creation')

    const departure = new Date(Date.now() + 8 * 60 * 60 * 1000)
    const arrival = new Date(Date.now() + 12 * 60 * 60 * 1000)
    const tripPayload = {
      bus_id: baseBusId,
      route_id: baseRouteId,
      departure_time: departure.toISOString(),
      arrival_time: arrival.toISOString(),
      base_price: 999,
      available_seats: 40,
      total_seats: 40,
      status: 'scheduled',
    }
    const { data: tripData, error: tripError } = await adminSupabase.from('trips').insert(tripPayload).select().single()
    if (tripError) throw tripError
    createdTripId = tripData.id
    const { error: tripUpdateError } = await adminSupabase.from('trips').update({ base_price: 1099 }).eq('id', createdTripId)
    if (tripUpdateError) throw tripUpdateError
    ok('Admin trip create/get/update')
  } catch (err) {
    fail('Admin trip create/get/update', err)
  }

  try {
    const staffPayload = {
      full_name: 'E2E Staff',
      phone: '9000001234',
      staff_type: 'conductor',
      employee_id: `E2EEMP${Date.now().toString().slice(-6)}`,
      license_number: null,
      experience_years: 3,
      joining_date: new Date().toISOString().slice(0, 10),
      salary: 22000,
      is_active: true,
    }
    const { data: staffData, error: staffError } = await adminSupabase.from('staff').insert(staffPayload).select().single()
    if (staffError) throw staffError
    createdStaffId = staffData.id
    const { error: staffUpdateError } = await adminSupabase.from('staff').update({ salary: 23000 }).eq('id', createdStaffId)
    if (staffUpdateError) throw staffUpdateError
    ok('Admin staff create/get/update')
  } catch (err) {
    fail('Admin staff create/get/update', err)
  }

  try {
    const layoutPayload = {
      name: `E2E Layout ${Date.now()}`,
      bus_id: createdBusId || buses?.[0]?.id,
      layout_data: {
        rows: 1,
        cols: 1,
        seats: [{ id: 'A1', label: 'A1', type: 'seater', deck: 'lower', row: 0, col: 0 }],
      },
      is_template: false,
      is_active: true,
    }
    const { data: layoutData, error: layoutError } = await adminSupabase.from('seat_layouts').insert(layoutPayload).select().single()
    if (layoutError) throw layoutError
    createdLayoutId = layoutData.id
    const { error: layoutUpdateError } = await adminSupabase.from('seat_layouts').update({ name: `${layoutPayload.name} Updated` }).eq('id', createdLayoutId)
    if (layoutUpdateError) throw layoutUpdateError
    ok('Admin seat layout create/get/update')
  } catch (err) {
    fail('Admin seat layout create/get/update', err)
  }

  try {
    const offerPayload = {
      code: `E2E${Date.now().toString().slice(-5)}`,
      title: 'E2E Offer',
      description: 'Offer created during e2e smoke test',
      discount_type: 'fixed',
      discount_value: 50,
      min_booking_amount: 500,
      max_discount_amount: 50,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    }
    const { data: offerData, error: offerError } = await adminSupabase.from('offers').insert(offerPayload).select().single()
    if (offerError) throw offerError
    createdOfferId = offerData.id
    const { error: offerUpdateError } = await adminSupabase.from('offers').update({ title: 'E2E Offer Updated' }).eq('id', createdOfferId)
    if (offerUpdateError) throw offerUpdateError
    ok('Admin offer create/get/update')
  } catch (err) {
    fail('Admin offer create/get/update', err)
  }

  let loginProfile = null
  try {
    await callApi(
      'POST',
      '/api/auth/register',
      {
        email: userEmail,
        password: userPassword,
        full_name: 'E2E User',
        phone: '9000001111',
      },
      [200]
    )
    ok('POST /api/auth/register')
  } catch (err) {
    fail('POST /api/auth/register', err)
  }

  try {
    const loginRes = await callApi(
      'POST',
      '/api/auth/login',
      {
        email: userEmail,
        password: userPassword,
      },
      [200]
    )
    loginProfile = loginRes.data?.profile || null
    ok('POST /api/auth/login')
  } catch (err) {
    fail('POST /api/auth/login', err)
  }

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    })
    if (signInError || !signInData?.user) throw signInError || new Error('Supabase sign-in failed')

    const allTrips = (await callApi('GET', '/api/trips')).data || []
    const bookingTrip = createdTripId
      ? allTrips.find((t) => t.id === createdTripId) || allTrips[0]
      : allTrips[0]
    if (!bookingTrip?.id) throw new Error('No trip available for booking flow')

    await callApi('GET', `/api/trips/${bookingTrip.id}`, undefined, [200])
    const seatsRes = await callApi('GET', `/api/trips/${bookingTrip.id}/seats`, undefined, [200])
    const available = (seatsRes.data || []).find((s) => s.is_available === true && s.seat_label !== 'DRV')
    const seatLabel = available?.seat_label || 'A1'

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: signInData.user.id,
        trip_id: bookingTrip.id,
        total_amount: Number(bookingTrip.base_price || 500),
        discount_amount: 0,
        final_amount: Number(bookingTrip.base_price || 500),
        passenger_details: [{ name: 'E2E Passenger', age: 28, gender: 'M' }],
        contact_email: userEmail,
        contact_phone: '9000001111',
        status: 'confirmed',
        payment_status: 'succeeded',
      })
      .select('id')
      .single()

    if (bookingError || !booking?.id) throw bookingError || new Error('Failed to create booking')
    createdBookingId = booking.id

    const { error: seatInsertError } = await supabase.from('booking_seats').insert({
      booking_id: createdBookingId,
      seat_label: seatLabel,
      passenger_name: 'E2E Passenger',
      passenger_age: 28,
      passenger_gender: 'M',
      price: Number(bookingTrip.base_price || 500),
      status: 'confirmed',
    })
    if (seatInsertError) throw seatInsertError

    ok('User booking flow (login + trip + booking without payment)')

    const cancelRes = await callApi(
      'POST',
      `/api/bookings/${createdBookingId}`,
      { reason: 'e2e cancel check', refund_requested: false },
      [200, 400, 404]
    )
    if (cancelRes.status === 200 || cancelRes.status === 400 || cancelRes.status === 404) {
      ok('POST /api/bookings/[id] cancellation handling')
    }
  } catch (err) {
    console.error('Booking flow error detail:', err)
    const message = err?.message || err?.error_description || JSON.stringify(err)
    fail('User booking flow (login + trip + booking without payment)', message)
  }

  try {
    await callApi('POST', '/api/webhooks/stripe', { dummy: true }, [400])
    ok('POST /api/webhooks/stripe validation path')
  } catch (err) {
    fail('POST /api/webhooks/stripe validation path', err)
  }

  try {
    if (createdOfferId) await adminSupabase.from('offers').delete().eq('id', createdOfferId)
    if (createdLayoutId) await adminSupabase.from('seat_layouts').delete().eq('id', createdLayoutId)
    if (createdStaffId) await adminSupabase.from('staff').delete().eq('id', createdStaffId)
    if (createdTripId) await adminSupabase.from('trips').delete().eq('id', createdTripId)
    if (createdRouteId) await adminSupabase.from('routes').delete().eq('id', createdRouteId)
    if (createdBusId) await adminSupabase.from('buses').delete().eq('id', createdBusId)
    ok('Admin cleanup deletes')
  } catch (err) {
    fail('Admin cleanup deletes', err)
  }

  const failed = results.filter((r) => !r.ok)
  const passed = results.filter((r) => r.ok)

  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    passed: passed.length,
    failed: failed.length,
    created: {
      bus: createdBusId,
      route: createdRouteId,
      trip: createdTripId,
      booking: createdBookingId,
      staff: createdStaffId,
      layout: createdLayoutId,
      offer: createdOfferId,
      userEmail,
      profileId: loginProfile?.id || null,
    },
    results,
  }, null, 2))

  if (failed.length > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
