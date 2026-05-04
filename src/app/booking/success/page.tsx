'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box, Container, Typography, Paper, Stack, Button, Grid, Chip,
  Divider, alpha, useTheme, Skeleton, Avatar,
} from '@mui/material'
import {
  CheckCircle2, Download, Mail, Printer, ArrowRight,
  Bus, MapPin, Clock, Calendar, Users, Ticket, QrCode,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '@/components/common/Navbar'
import { useBookingStore } from '@/store'
import type { Booking, BookingSeat, Bus as BusType, PassengerDetail, Route as RouteType, Trip as TripType } from '@/types/supabase'
import { generateETicketPDF } from '@/lib/generateETicketPDF'

type BookingDetail = Booking & {
  trip?: TripType & { route?: RouteType; bus?: BusType }
  booking_seats?: BookingSeat[]
}

function BookingSuccessContent() {
  const router = useRouter()
  const theme = useTheme()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const sessionId = searchParams.get('session_id')
  const { clearSeats } = useBookingStore()
  const [pdfLoading, setPdfLoading] = useState(false)

  const { data: booking, isLoading } = useQuery<BookingDetail>({
    queryKey: ['booking-success', bookingId, sessionId],
    queryFn: async () => {
      if (!bookingId) throw new Error('No booking ID')
      if (sessionId) {
        const confirmRes = await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, sessionId }),
        })
        
        if (!confirmRes.ok) {
          const data = await confirmRes.json().catch(() => null)
          // Throw 409 specifically to trigger the retry logic
          if (confirmRes.status === 409) {
            throw new Error('409: Payment still processing')
          }
          throw new Error(data?.message || 'Failed to verify payment status')
        }
      }
      // Use our API (admin client) so RLS never blocks route/bus joins
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Failed to load booking')
      }
      return res.json() as Promise<BookingDetail>
    },
    enabled: !!bookingId,
    retry: (failureCount, error: unknown) => {
      // Retry if payment is pending (409) up to 10 times (20 seconds total)
      const message =
        typeof error === 'object' && error && 'message' in error ? String((error as { message?: unknown }).message) : ''
      if (message.includes('404') || message.includes('409')) return failureCount < 10
      return false
    },
    retryDelay: 2000,
  })

  useEffect(() => {
    if (booking?.status === 'confirmed') {
      clearSeats()
    }
  }, [booking?.status, clearSeats])

  useEffect(() => {
    if (!bookingId && !isLoading) router.push('/dashboard')
  }, [bookingId, isLoading, router])

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ pt: 20, textAlign: 'center' }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 4 }} />
          <Skeleton width="60%" height={40} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton width="40%" height={24} sx={{ mx: 'auto' }} />
        </Container>
      </Box>
    )
  }

  if (!booking) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ pt: 20, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>Booking Not Found</Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>We couldn't retrieve the details for this booking reference.</Typography>
          <Button variant="contained" component={Link} href="/dashboard">Go to My Bookings</Button>
        </Container>
      </Box>
    )
  }

  const qrPayload = JSON.stringify({
    ref: booking.booking_reference,
    booking_id: booking.id,
    trip_id: booking.trip_id,
    seats: booking.booking_seats?.map((s) => s.seat_label),
  })

  // Handle Supabase potentially returning these as arrays or objects
  const rawTrip = Array.isArray(booking.trip) ? booking.trip[0] : booking.trip
  const trip = rawTrip as (TripType & { route?: RouteType | RouteType[]; bus?: BusType | BusType[] }) | undefined
  
  const route = Array.isArray(trip?.route) ? trip?.route[0] : trip?.route
  const bus = Array.isArray(trip?.bus) ? trip?.bus[0] : trip?.bus

  const dep = trip?.departure_time
  const arr = trip?.arrival_time
  const passengers = Array.isArray(booking.passenger_details) ? booking.passenger_details as PassengerDetail[] : []

  const handlePrint = () => window.print()
  const handleDownload = async () => {
    if (!booking) return
    setPdfLoading(true)
    try {
      await generateETicketPDF(
        booking as unknown as Parameters<typeof generateETicketPDF>[0],
        route || {},
        bus || {},
        trip || {},
        qrPayload
      )
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Container maxWidth="md" sx={{ pt: { xs: 14, md: 16 }, pb: 10 }}>
        {/* Celebration Header */}
        <Stack alignItems="center" textAlign="center" spacing={2} sx={{ mb: 6 }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'bounce 0.6s ease',
              '@keyframes bounce': {
                '0%': { transform: 'scale(0)' },
                '60%': { transform: 'scale(1.15)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          >
            <CheckCircle2 size={48} style={{ color: theme.palette.success.main }} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>Booking Confirmed! 🎉</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Your seats are reserved. Present the QR code below at the boarding point.
            </Typography>
          </Box>
          <Chip
            label={`REF: ${booking.booking_reference}`}
            color="success"
            sx={{ fontWeight: 900, fontSize: '1rem', py: 2.5, px: 1, letterSpacing: '0.1em' }}
          />
        </Stack>

        {/* E-Ticket Card */}
        <Paper
          id="eticket"
          elevation={0}
          sx={{
            borderRadius: 8,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            mb: 4,
          }}
        >
          {/* Ticket Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 60%, #7c3aed)`,
              p: { xs: 3, md: 4 },
              color: 'white',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Bus size={28} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>E-TICKET</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontWeight: 700 }}>
                    {bus?.name} · {bus?.bus_type}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={booking.status?.toUpperCase()}
                sx={{
                  bgcolor: booking.status === 'confirmed' ? alpha('#22c55e', 0.25) : alpha('#f59e0b', 0.25),
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                }}
              />
            </Stack>
          </Box>

          {/* Route Info */}
          <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: '1px dashed', borderColor: 'divider' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 5 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, color: 'text.secondary' }}>
                  From
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {route?.origin}
                </Typography>
                {dep && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {new Date(dep).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(dep).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Stack alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 80, height: 2, bgcolor: 'divider', borderRadius: 1 }} />
                  <Bus size={22} style={{ color: theme.palette.text.disabled }} />
                  <Box sx={{ width: 80, height: 2, bgcolor: 'divider', borderRadius: 1 }} />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { sm: 'right' } }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, color: 'text.secondary' }}>
                  To
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {route?.destination}
                </Typography>
                {arr && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {new Date(arr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(arr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Passenger & Seat Details */}
          <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
              Passengers & Seats
            </Typography>
            <Stack spacing={2}>
              {booking.booking_seats?.map((seat, idx) => {
                const passenger = passengers[idx]
                return (
                  <Stack key={seat.id} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36, height: 36, fontSize: '0.8rem', fontWeight: 900,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }}
                      >
                        {(passenger?.name || seat.passenger_name || 'P')[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {passenger?.name || seat.passenger_name || `Passenger ${idx + 1}`}
                        </Typography>
                        {passenger?.age && (
                          <Typography variant="caption" color="text.secondary">Age: {passenger.age}</Typography>
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={`SEAT ${seat.seat_label}`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 900, letterSpacing: '0.05em' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        ₹{Number(seat.price).toLocaleString('en-IN')}
                      </Typography>
                    </Stack>
                  </Stack>
                )
              })}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              {[
                { icon: Calendar, label: 'Booking Date', value: new Date(booking.created_at).toLocaleDateString('en-IN') },
                { icon: Users, label: 'Passengers', value: booking.booking_seats?.length || 0 },
                { icon: Clock, label: 'Contact', value: booking.contact_phone },
                { icon: Mail, label: 'Email', value: booking.contact_email },
              ].map((detail) => (
                <Grid key={detail.label} size={{ xs: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', mt: 0.25 }}>
                      <detail.icon size={14} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {detail.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{detail.value}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* QR Code + Total */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, sm: 5 }}>
                <Stack alignItems="center" spacing={2}>
                  <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'divider', boxShadow: theme.shadows[4] }}>
                    <QRCodeSVG value={qrPayload} size={180} level="Q" />
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <QrCode size={14} style={{ color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Scan at boarding point
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
                    Fare Summary
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Base Fare</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{Number(booking.total_amount).toLocaleString('en-IN')}</Typography>
                    </Stack>
                    {Number(booking.discount_amount) > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Discount</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>-₹{Number(booking.discount_amount).toLocaleString('en-IN')}</Typography>
                      </Stack>
                    )}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Total Paid</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        ₹{Number(booking.final_amount).toLocaleString('en-IN')}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Chip
                    label={`Payment: ${booking.payment_status?.toUpperCase()}`}
                    color={booking.payment_status === 'succeeded' ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 2, fontWeight: 800 }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint} sx={{ borderRadius: 4, fontWeight: 700, px: 4 }}>
            Print Ticket
          </Button>
          <Button
            variant="outlined"
            startIcon={pdfLoading ? <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Download size={18} />}
            onClick={handleDownload}
            disabled={pdfLoading}
            sx={{ borderRadius: 4, fontWeight: 700, px: 4 }}
          >
            {pdfLoading ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button variant="contained" startIcon={<Ticket size={18} />} component={Link} href="/dashboard" sx={{ borderRadius: 4, fontWeight: 800, px: 4 }}>
            My Bookings
          </Button>
        </Stack>

        {/* Navigation Links */}
        <Stack direction="row" spacing={3} justifyContent="center">
          <Button component={Link} href="/search" variant="text" endIcon={<ArrowRight size={16} />} sx={{ fontWeight: 700 }}>
            Book Another Trip
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
          <Skeleton variant="circular" width={80} height={80} />
        </Box>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  )
}
