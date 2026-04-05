'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowRight, Bus, Calendar, Clock, Download, FileText, QrCode, Ticket as TicketIcon } from 'lucide-react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  alpha,
  useTheme,
  Skeleton,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Container,
  Fade,
} from '@mui/material'
import { getMyBookings } from '@/lib/api'
import type { SearchTrip } from '@/types/supabase'

type MaybeArray<T> = T | T[] | null | undefined
function firstItem<T>(value: MaybeArray<T>): T | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

type BookingStatusFilter = 'all' | 'confirmed' | 'cancelled' | 'upcoming'

type DashboardRoute = { origin?: string; destination?: string }
type DashboardBus = { name?: string; bus_type?: string }
type DashboardTrip = {
  departure_time?: string
  arrival_time?: string
  route?: MaybeArray<DashboardRoute>
  routes?: MaybeArray<DashboardRoute>
  bus?: MaybeArray<DashboardBus>
  buses?: MaybeArray<DashboardBus>
}

type DashboardBooking = {
  id: string
  booking_reference: string
  trip_id: string
  status: string
  final_amount: number
  total_amount?: number
  discount_amount?: number
  created_at: string
  trip?: MaybeArray<DashboardTrip>
  trips?: MaybeArray<DashboardTrip>
  booking_seats?: { seat_label: string; passenger_name?: string; passenger_age?: number }[]
}

function getHoursUntilDeparture(booking: DashboardBooking): number {
  const trip = firstItem(booking.trip ?? booking.trips)
  if (!trip?.departure_time) return -1
  return (new Date(trip.departure_time).getTime() - Date.now()) / 36e5
}

// ─── PDF Generator ────────────────────────────────────────────────────────────
async function downloadETicketPDF(
  booking: DashboardBooking,
  route: DashboardRoute,
  bus: DashboardBus,
  trip: DashboardTrip,
  qrPayload: string
) {
  // Dynamically import jsPDF to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2

  // ── Background ──
  doc.setFillColor(15, 23, 42) // slate-950
  doc.rect(0, 0, pageW, 297, 'F')

  // ── Header band ──
  doc.setFillColor(37, 99, 235) // blue-600
  doc.rect(0, 0, pageW, 38, 'F')

  // Company name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text('Voyatra', margin, 16)

  // Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(147, 197, 253) // blue-300
  doc.text('Your Journey, Our Commitment', margin, 23)

  // E-TICKET label on right
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('E-TICKET', pageW - margin, 14, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(147, 197, 253)
  doc.text('ELECTRONIC BOARDING PASS', pageW - margin, 21, { align: 'right' })

  // ── Reference and status row ──
  let y = 50
  doc.setFillColor(30, 41, 59) // slate-800
  doc.roundedRect(margin, y - 6, contentW, 18, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text(`REF: ${booking.booking_reference || booking.id.slice(0, 8).toUpperCase()}`, margin + 4, y + 4)

  const statusColor = booking.status === 'confirmed' ? [34, 197, 94] : [239, 68, 68] // green or red
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
  const statusLabel = booking.status.toUpperCase()
  doc.roundedRect(pageW - margin - 30, y - 3, 30, 10, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(statusLabel, pageW - margin - 15, y + 4, { align: 'center' })

  // ── Route section ──
  y += 26
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text('ROUTE', margin, y)

  y += 6
  const origin = route?.origin || 'N/A'
  const destination = route?.destination || 'N/A'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(origin, margin, y + 4)

  // Arrow
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(96, 165, 250) // blue-400
  doc.text('→', pageW / 2, y + 4, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(destination, pageW - margin, y + 4, { align: 'right' })

  // ── Dashed separator ──
  y += 18
  doc.setDrawColor(51, 65, 85) // slate-700
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageW - margin, y)
  doc.setLineDashPattern([], 0)

  // ── Trip details grid ──
  y += 10
  const col1 = margin
  const col2 = margin + contentW / 3
  const col3 = margin + (contentW * 2) / 3

  const depDate = trip?.departure_time
    ? new Date(trip.departure_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBD'
  const depTime = trip?.departure_time
    ? new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'TBD'
  const arrTime = trip?.arrival_time
    ? new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'TBD'

  const details = [
    { col: col1, label: 'DATE', value: depDate },
    { col: col2, label: 'DEPARTURE', value: depTime },
    { col: col3, label: 'ARRIVAL', value: arrTime },
  ]

  details.forEach(({ col, label, value }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(label, col, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text(value, col, y + 7)
  })

  y += 20
  // Bus info row
  const busDetails = [
    { col: col1, label: 'BUS', value: bus?.name || 'N/A' },
    { col: col2, label: 'BUS TYPE', value: bus?.bus_type || 'N/A' },
    { col: col3, label: 'BOOKED ON', value: new Date(booking.created_at).toLocaleDateString('en-IN') },
  ]

  busDetails.forEach(({ col, label, value }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(label, col, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text(value, col, y + 7)
  })

  // ── Dashed separator ──
  y += 20
  doc.setDrawColor(51, 65, 85)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageW - margin, y)
  doc.setLineDashPattern([], 0)

  // ── Passengers table ──
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(96, 165, 250)
  doc.text('PASSENGER DETAILS', margin, y)

  y += 6
  // Table header
  doc.setFillColor(30, 41, 59)
  doc.rect(margin, y, contentW, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('#', margin + 3, y + 5)
  doc.text('SEAT', margin + 12, y + 5)
  doc.text('PASSENGER NAME', margin + 35, y + 5)
  doc.text('AGE', margin + contentW - 20, y + 5)

  y += 8
  const seats = booking.booking_seats || []
  seats.forEach((seat, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(22, 33, 51)
      doc.rect(margin, y, contentW, 8, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(String(idx + 1), margin + 3, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(96, 165, 250)
    doc.text(seat.seat_label, margin + 12, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text(seat.passenger_name || '—', margin + 35, y + 5)
    doc.text(seat.passenger_age ? String(seat.passenger_age) : '—', margin + contentW - 20, y + 5)
    y += 8
  })

  // ── Dashed separator ──
  y += 4
  doc.setDrawColor(51, 65, 85)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageW - margin, y)
  doc.setLineDashPattern([], 0)

  // ── Pricing ──
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(96, 165, 250)
  doc.text('FARE DETAILS', margin, y)

  y += 6
  const subtotal = booking.total_amount || 0
  const discount = booking.discount_amount || 0
  const finalAmt = booking.final_amount || 0

  const pricingRows: Array<{ label: string; value: string; highlight?: boolean; strike?: boolean }> = [
    { label: 'Ticket Price:', value: `Rs. ${subtotal.toLocaleString()}` },
  ]
  if (discount > 0) {
    pricingRows.push({ label: 'Coupon Discount:', value: `-Rs. ${discount.toLocaleString()}`, highlight: true })
  }
  pricingRows.push({ label: 'Total Paid:', value: `Rs. ${finalAmt.toLocaleString()}`, highlight: true })

  pricingRows.forEach(({ label, value, highlight }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(highlight ? 11 : 9)
    doc.setTextColor(highlight ? 255 : 148, highlight ? 255 : 163, highlight ? 255 : 184)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(highlight ? 96 : 255, highlight ? 165 : 255, highlight ? 250 : 255)
    if (highlight && label.includes('Total')) doc.setFontSize(13)
    doc.text(value, pageW - margin, y, { align: 'right' })
    y += highlight && label.includes('Total') ? 9 : 7
  })

  // ── QR code ──
  // Render QR code SVG to canvas, then add to PDF
  const qrSize = 45
  const qrX = pageW - margin - qrSize
  const qrY = 200

  // White background for QR
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 10, 2, 2, 'F')

  try {
    const qrCanvas = document.createElement('canvas')
    qrCanvas.width = 200
    qrCanvas.height = 200
    // Use QRCode library from qrcode.react's underlying lib
    const QRCode = (await import('qrcode')).default
    await QRCode.toCanvas(qrCanvas, qrPayload, {
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    })
    const qrDataUrl = qrCanvas.toDataURL('image/png')
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  } catch {
    // If QR rendering fails, just add a placeholder text
    doc.setFontSize(7)
    doc.setTextColor(0, 0, 0)
    doc.text('QR CODE', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' })
  }

  // QR label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text('SCAN AT BOARDING', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' })

  // ── Footer ──
  const footerY = 282
  doc.setFillColor(30, 41, 59)
  doc.rect(0, footerY - 4, pageW, 20, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('This is an auto-generated e-ticket. Please carry a valid photo ID. Voyatra Bus Agency.', pageW / 2, footerY + 4, { align: 'center' })

  doc.save(`Voyatra-Ticket-${booking.booking_reference || booking.id.slice(0, 8)}.pdf`)
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all')
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)
  const theme = useTheme()

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['my-bookings', statusFilter],
    queryFn: () => getMyBookings(statusFilter),
  })

  const typedBookings = bookings as DashboardBooking[]

  const tripIdsNeedingLookup = useMemo(() => {
    const ids = new Set<string>()
    for (const booking of typedBookings) {
      const trip = firstItem(booking.trip ?? booking.trips)
      const route = firstItem(trip?.route ?? trip?.routes)
      const bus = firstItem(trip?.bus ?? trip?.buses)
      if (!route?.origin || !route?.destination || !bus?.name) ids.add(booking.trip_id)
    }
    return Array.from(ids)
  }, [typedBookings])

  const { data: tripLookupById = {} } = useQuery({
    queryKey: ['trip-lookup', tripIdsNeedingLookup],
    enabled: tripIdsNeedingLookup.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const entries = await Promise.all(
        tripIdsNeedingLookup.map(async (tripId) => {
          try {
            const res = await fetch(`/api/trips/${tripId}`)
            if (!res.ok) return [tripId, null] as const
            const data = (await res.json()) as SearchTrip
            return [tripId, data] as const
          } catch {
            return [tripId, null] as const
          }
        })
      )
      return Object.fromEntries(entries) as Record<string, SearchTrip | null>
    },
  })

  const filteredBookings = useMemo(() => {
    return typedBookings.filter((booking) => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'confirmed') return booking.status === 'confirmed'
      if (statusFilter === 'cancelled') return booking.status === 'cancelled'
      if (statusFilter === 'upcoming') {
        const hours = getHoursUntilDeparture(booking)
        return booking.status === 'confirmed' && hours > 0
      }
      return true
    })
  }, [statusFilter, typedBookings])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
            My Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredBookings.length} of {typedBookings.length} trips
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, value: BookingStatusFilter | null) => value && setStatusFilter(value)}
          size="small"
          sx={{ borderRadius: 3 }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="upcoming">Upcoming</ToggleButton>
          <ToggleButton value="confirmed">Confirmed</ToggleButton>
          <ToggleButton value="cancelled">Cancelled</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      ) : filteredBookings.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'divider',
            textAlign: 'center',
            bgcolor: alpha(theme.palette.divider, 0.02),
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mb: 2,
            }}
          >
            <TicketIcon size={32} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No bookings found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Search trips and complete your first booking.
          </Typography>
          <Button variant="contained" size="large" sx={{ borderRadius: 4, px: 4 }} href="/search">
            Book a Bus
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {filteredBookings.map((booking) => {
            const trip = firstItem(booking.trip ?? booking.trips) ?? {}
             
            const routeFromTrip = firstItem(trip.route ?? trip.routes)
            const routeFromLookup = tripLookupById[booking.trip_id]?.route
            const route = (routeFromTrip?.origin && routeFromTrip?.destination ? routeFromTrip : routeFromLookup) ?? {}

            const busFromTrip = firstItem(trip.bus ?? trip.buses)
            const busFromLookup = tripLookupById[booking.trip_id]?.bus
            const bus = (busFromTrip?.name ? busFromTrip : busFromLookup) ?? {}
            const isConfirmed = booking.status === 'confirmed'
            const departureHours = getHoursUntilDeparture(booking)
            const timeColor =
              departureHours > 24 ? 'text.primary' : departureHours > 2 ? 'warning.main' : 'error.main'
            const timeWeight = departureHours > 24 ? 600 : departureHours > 2 ? 700 : 900
            const qrPayload = JSON.stringify({
              id: booking.booking_reference,
              trip_id: booking.trip_id,
              seats: booking.booking_seats?.map((seat) => seat.seat_label) || [],
            })

            const handleDownloadPDF = async () => {
              setPdfLoading(booking.id)
              try {
                await downloadETicketPDF(booking, route, bus, trip, qrPayload)
              } catch (err) {
                console.error('PDF generation failed:', err)
              } finally {
                setPdfLoading(null)
              }
            }

            return (
              <Paper
                key={booking.id}
                elevation={selectedTicket === booking.id ? 8 : 0}
                sx={{
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: selectedTicket === booking.id ? 'primary.main' : 'divider',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.divider, 0.05),
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={booking.status.toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: isConfirmed ? alpha(theme.palette.success.main, 0.1) : 'divider',
                        color: isConfirmed ? 'success.main' : 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>
                      REF: {booking.booking_reference}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Booked on {new Date(booking.created_at).toLocaleDateString('en-IN')}
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, lg: 8 }}>
                      <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                          }}
                        >
                          <Bus size={28} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {route?.origin || 'N/A'}
                            </Typography>
                            <ArrowRight size={20} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {route?.destination || 'N/A'}
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
                            {bus?.name || 'Bus Not Available'}
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 4 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Departure Date
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Calendar size={14} color={theme.palette.text.secondary} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {trip?.departure_time
                                      ? new Date(trip.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                      : 'TBD'}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Time to Departure
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: timeWeight, color: timeColor }}>
                                  {departureHours > 0 ? `${Math.round(departureHours)}h` : 'Departed'}
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Departure Time
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Clock size={14} color={theme.palette.text.secondary} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {trip?.departure_time
                                      ? new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                      : 'TBD'}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Seats
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                  {booking.booking_seats?.map((seat) => seat.seat_label).join(', ') || 'N/A'}
                                </Typography>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                      <Stack
                        direction={{ xs: 'row', lg: 'column' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'center', lg: 'flex-end' }}
                        spacing={3}
                        sx={{
                          pl: { lg: 4 },
                          borderLeft: { lg: '1px solid' },
                          borderColor: { lg: 'divider' },
                        }}
                      >
                        <Box sx={{ textAlign: { lg: 'right' } }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Total Amount
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            ₹{Number(booking.final_amount || 0).toLocaleString()}
                          </Typography>
                          {(booking.discount_amount ?? 0) > 0 && (
                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                              Saved ₹{booking.discount_amount?.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={1}>
                          {isConfirmed && (
                            <Button
                              variant={selectedTicket === booking.id ? 'contained' : 'outlined'}
                              color="primary"
                              startIcon={selectedTicket === booking.id ? <QrCode size={18} /> : <TicketIcon size={18} />}
                              onClick={() => setSelectedTicket(selectedTicket === booking.id ? null : booking.id)}
                              sx={{ borderRadius: 3, px: 3 }}
                            >
                              {selectedTicket === booking.id ? 'Hide E-Ticket' : 'View E-Ticket'}
                            </Button>
                          )}
                          {departureHours > 2 && booking.status === 'confirmed' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={async () => {
                                const ok = window.confirm(`Cancel booking ${booking.booking_reference}?`)
                                if (!ok) return

                                const res = await fetch(`/api/bookings/${booking.id}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ reason: 'Customer request' }),
                                })
                                if (res.ok) {
                                  await refetch()
                                } else {
                                  window.alert('Cancellation failed')
                                }
                              }}
                              sx={{ borderRadius: 3 }}
                            >
                              Cancel
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                {selectedTicket === booking.id && (
                  <Fade in={selectedTicket === booking.id}>
                    <Box
                      sx={{
                        p: 4,
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        borderTop: '2px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 'auto' }}>
                          <Paper
                            elevation={4}
                            sx={{
                              p: 2.5,
                              borderRadius: 1,
                              bgcolor: 'white',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              maxWidth: 190,
                              mx: 'auto',
                            }}
                          >
                            <QRCodeSVG value={qrPayload} size={150} level="Q" includeMargin={false} />
                            <Typography variant="overline" sx={{ mt: 1.5, fontWeight: 900, fontSize: '0.7rem' }}>
                              SCAN AT BOARDING
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 'grow' }}>
                          <Stack spacing={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                                Digital Ticket Ready
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Show this QR at boarding. A printed copy is optional.
                              </Typography>
                              {/* Route details in expanded ticket view */}
                              <Stack spacing={0.5} sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15) }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                  Route — {bus?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {route?.origin || 'N/A'} → {route?.destination || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Dep: {trip?.departure_time ? new Date(trip.departure_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                  {trip?.arrival_time ? ` · Arr: ${new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                              <Button
                                size="small"
                                startIcon={pdfLoading === booking.id ? <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Download size={16} />}
                                onClick={handleDownloadPDF}
                                disabled={pdfLoading === booking.id}
                                sx={{ color: 'primary.main', fontWeight: 700 }}
                              >
                                {pdfLoading === booking.id ? 'Generating...' : 'Download PDF'}
                              </Button>
                              <Button size="small" startIcon={<FileText size={16} />} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Email Receipt
                              </Button>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                )}
              </Paper>
            )
          })}
        </Stack>
      )}
      </Stack>
      </Container>
    </Box>
  )
}
