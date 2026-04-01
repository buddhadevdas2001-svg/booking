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
} from '@mui/material'
import Navbar from '@/components/common/Navbar'

import { getMyBookings } from '@/lib/api'

type BookingStatusFilter = 'all' | 'confirmed' | 'cancelled' | 'upcoming'

type DashboardBooking = {
  id: string
  booking_reference: string
  trip_id: string
  status: string
  final_amount: number
  created_at: string
  trip?: {
    departure_time?: string
    route?: { origin?: string; destination?: string }
    bus?: { name?: string }
  }
  booking_seats?: { seat_label: string }[]
}

function getHoursUntilDeparture(booking: DashboardBooking): number {
  if (!booking.trip?.departure_time) return -1
  return (new Date(booking.trip.departure_time).getTime() - Date.now()) / 36e5
}

export default function MyBookingsPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all')
  const theme = useTheme()

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['my-bookings', statusFilter],
    queryFn: () => getMyBookings(statusFilter),
  })

  const typedBookings = bookings as DashboardBooking[]

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
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: 8 }}>
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
                              {booking.trip?.route?.origin || 'N/A'}
                            </Typography>
                            <ArrowRight size={20} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {booking.trip?.route?.destination || 'N/A'}
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
                            {booking.trip?.bus?.name || 'Bus Not Available'}
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
                                    {booking.trip?.departure_time
                                      ? new Date(booking.trip.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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
                                    {booking.trip?.departure_time
                                      ? new Date(booking.trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
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
                              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                                Digital Ticket Ready
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Show this QR at boarding. A printed copy is optional.
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                              <Button size="small" startIcon={<Download size={16} />} sx={{ color: 'primary.main', fontWeight: 700 }}>
                                Download PDF
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
