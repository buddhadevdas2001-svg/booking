// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const { period = 'daily', format = 'json' } = await req.json().catch(() => ({ period: 'daily', format: 'json' }))

  const endDate = new Date()
  const startDate = new Date(endDate)

  if (period === 'weekly') startDate.setDate(endDate.getDate() - 7)
  if (period === 'monthly') startDate.setMonth(endDate.getMonth() - 1)
  if (period === 'daily') startDate.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trips(
        *,
        route:routes(*)
      )
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'confirmed')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const bookings = data || []
  const totalRevenue = bookings.reduce(
    (sum, booking: { final_amount: number }) => sum + Number(booking.final_amount),
    0
  )

  const report = {
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalBookings: bookings.length,
    totalRevenue,
    uniqueCustomers: new Set(bookings.map((booking) => booking.user_id)).size,
    averageBookingValue: bookings.length ? totalRevenue / bookings.length : 0,
    popularRoutes: getPopularRoutes(bookings),
  }

  if (format === 'csv') {
    return new Response(generateCsv(report), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=report-${period}-${Date.now()}.csv`,
      },
    })
  }

  return new Response(
    JSON.stringify(report),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

function getPopularRoutes(bookings) {
  const routes = {}

  bookings.forEach((booking) => {
    const routeName = booking.trip?.route
      ? `${booking.trip.route.origin} -> ${booking.trip.route.destination}`
      : 'Unknown route'

    routes[routeName] = (routes[routeName] || 0) + 1
  })

  return Object.entries(routes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([route, count]) => ({ route, count }))
}

function generateCsv(report) {
  const rows = [
    ['period', report.period],
    ['startDate', report.startDate],
    ['endDate', report.endDate],
    ['totalBookings', String(report.totalBookings)],
    ['totalRevenue', String(report.totalRevenue)],
    ['uniqueCustomers', String(report.uniqueCustomers)],
    ['averageBookingValue', String(report.averageBookingValue)],
    [],
    ['route', 'count'],
    ...report.popularRoutes.map((item) => [item.route, String(item.count)]),
  ]

  return rows.map((row) => row.join(',')).join('\n')
}
