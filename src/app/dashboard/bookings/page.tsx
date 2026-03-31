'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Bus,
  Calendar,
  Clock,
  Download,
  FileText,
  MapPin,
  ArrowRight,
  QrCode,
  Ticket as TicketIcon,
} from 'lucide-react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  alpha,
  useTheme,
  Divider,
  Skeleton,
  Fade,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'

import { getMyBookings } from '@/lib/api'

export default function MyBookingsPage() {
const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'upcoming'>('all')
  const theme = useTheme()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', statusFilter],
    queryFn: () => getMyBookings(),
  })

  const filteredBookings = bookings.filter((booking: any) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'confirmed') return booking.status === 'confirmed'
    if (statusFilter === 'cancelled') return booking.status === 'cancelled'
    if (statusFilter === 'upcoming') {
      const hours = (new Date(booking.trip?.departure_time || 0).getTime() - Date.now()) / 36e5
      return booking.status === 'confirmed' && hours > 0
    }
    return true
  })

  const hoursUntilDeparture = (booking: any) => {
    return (new Date(booking.trip?.departure_time || 0).getTime() - Date.now()) / 36e5
  }


  return (
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
            My Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredBookings.length} of {bookings.length} {statusFilter !== 'all' && `(${statusFilter})`} trips
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => v && setStatusFilter(v as any)}
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
            <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 6 }} />
          ))}
        </Stack>
      ) : bookings.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            borderRadius: 6,
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
            No bookings found yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Ready for your next adventure? Let's find you a ride.
          </Typography>
          <Button variant="contained" size="large" sx={{ borderRadius: 4, px: 4 }}>
            Book a Bus
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'confirmed'
            const departureHours = hoursUntilDeparture(booking)
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
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: selectedTicket === booking.id ? 'primary.main' : 'divider',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                {/* Booking Header */}
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
                    Booked on: {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>

                {/* Booking Content */}
                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, lg: 8 }}>
                      <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                          }}
                        >
                          <Bus size={28} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {booking.trip?.route?.origin}
                            </Typography>
                            <ArrowRight size={20} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {booking.trip?.route?.destination}
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
                            {booking.trip?.bus?.name}
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
                                <Typography variant="body2" sx={{ fontWeight: `${hoursUntilDeparture > 24 ? '600' : hoursUntilDeparture > 2 ? '700' : '900'}`, color: `${hoursUntilDeparture > 24 ? 'text.primary' : hoursUntilDeparture > 2 ? 'warning.main' : 'error.main'}` }}>
                                  {hoursUntilDeparture > 0 ? `${Math.round(hoursUntilDeparture)}h` : 'Departed'}
                                </Typography>
                              </Stack>
                            </Grid>

                                </Stack>
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
                                  Seats Booked
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
                            Total Amount Paid
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            ₹{Number(booking.final_amount).toLocaleString()}
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
                                if (confirm(`Cancel booking ${booking.booking_reference}?`)) {
                                  const res = await fetch(`/api/bookings/${booking.id}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reason: 'Customer request' })
                                  })
                                  if (res.ok) {
                                    window.location.reload()
                                  } else {
                                    alert('Cancellation failed')
                                  }
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

                {/* E-Ticket Display */}
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
                              borderRadius: 4,
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
                                Please show this QR code to the conductor upon boarding. No printed copy is required.
                                Ensure your phone is sufficiently charged.
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                              <Button
                                size="small"
                                startIcon={<Download size={16} />}
                                sx={{ color: 'primary.main', fontWeight: 700 }}
                              >
                                Download PDF
                              </Button>
                              <Button
                                size="small"
                                startIcon={<FileText size={16} />}
                                sx={{ color: 'text.secondary', fontWeight: 600 }}
                              >
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
  )
}
