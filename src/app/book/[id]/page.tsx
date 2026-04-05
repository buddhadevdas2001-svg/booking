'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bus as BusIcon,
  Calendar,
  ChevronRight,
  Clock,
  Coffee,
  Luggage,
  MapPin,
  Power,
  Shield,
  Wifi,
  Info,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Chip,
  alpha,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
} from '@mui/material'
import Navbar from '@/components/common/Navbar'
import { getTripById, getAvailableSeats, lockSeats, unlockSeat } from '@/lib/api'
import { useRealtimeSeats } from '@/hooks/useRealtimeSeats'
import { useAuthStore, useBookingStore } from '@/store'
import type { AvailableSeatRow, SearchTrip, Seat, SeatLayoutData } from '@/types/supabase'
import { calculateDynamicPrice, getPricingBadge } from '@/lib/pricing_engine'

export default function SeatSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const theme = useTheme()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { tripId: activeTripId, selectedSeats, toggleSeat, clearSeats, setLockedSeats, setSessionId, sessionId, setTripId } = useBookingStore()
  const [selectedDeck, setSelectedDeck] = useState<'lower' | 'upper'>('lower')

  const { data: trip, isLoading: tripLoading } = useQuery<SearchTrip>({
    queryKey: ['trip', id],
    queryFn: () => getTripById(id),
  })

  const { data: seatAvailability = [], refetch: refetchSeatAvailability } = useQuery<AvailableSeatRow[]>({
    queryKey: ['trip-seat-availability', id],
    queryFn: () => getAvailableSeats(id),
    refetchInterval: 60_000,
  })

  useEffect(() => {
    if (activeTripId && activeTripId !== id) {
      clearSeats()
    }
    setTripId(id)
    if (!sessionId) setSessionId(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
  }, [activeTripId, clearSeats, id, sessionId, setSessionId, setTripId])

  useRealtimeSeats(id)

  useEffect(() => {
    setLockedSeats(seatAvailability.filter((seat) => seat.is_locked).map((seat) => seat.seat_label))
  }, [seatAvailability, setLockedSeats])

  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailableSeatRow>()
    seatAvailability.forEach((seat) => {
      map.set(seat.seat_label, seat)
    })
    return map
  }, [seatAvailability])

  const pricingResult = useMemo(() => {
    if (!trip) return null
    return calculateDynamicPrice({
      base_price: Number(trip.base_price) || 0,
      departure_time: trip.departure_time,
      available_seats: Number(trip.available_seats) || 0,
      total_seats: Number(trip.total_seats) || 0,
    })
  }, [trip])

  const pricingBadge = useMemo(() => pricingResult ? getPricingBadge(pricingResult) : null, [pricingResult])

  const effectivePrice = pricingResult?.effective_price ?? Number(trip?.base_price) ?? 0

  const calculateTotal = () => {
    return selectedSeats.reduce((acc, seat) => {
      const seatMultiplier = seat.price_multiplier ?? 1.0
      const seatResult = trip ? calculateDynamicPrice({
        base_price: Number(trip.base_price) || 0,
        departure_time: trip.departure_time,
        available_seats: Number(trip.available_seats) || 0,
        total_seats: Number(trip.total_seats) || 0,
        seat_price_multiplier: seatMultiplier,
      }) : null
      return acc + (seatResult?.effective_price ?? effectivePrice)
    }, 0)
  }

  const layout = (trip?.seat_layout?.layout_data || { rows: 0, cols: 4, seats: [], hasUpperDeck: false }) as SeatLayoutData
  const hasUpperDeck = layout.hasUpperDeck || false
  const lowerSeats = layout.seats.filter((seat) => seat.deck === 'lower')
  const upperSeats = layout.seats.filter((seat) => seat.deck === 'upper')
  const cols = layout.cols || 4

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/book/${id}`)
      return
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    router.push(`/checkout/${id}`)
  }

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, typeof Wifi> = {
      WiFi: Wifi,
      'Charging Point': Power,
      'Water Bottle': Coffee,
      Blanket: Shield,
      'Luggage Storage': Luggage,
    }
    const Icon = icons[amenity] || Shield
    return <Icon size={14} />
  }

  const renderSeat = (seat: Seat) => {
    const availability = availabilityMap.get(seat.label)
    const isSelected = selectedSeats.some((selectedSeat) => selectedSeat.label === seat.label)
    const isBooked = availability ? !availability.is_available : false
    const isLockedByAnotherUser = availability?.is_locked && !isSelected
    const isDriver = seat.type === 'driver'
    const isEmpty = seat.type === 'empty'

    if (isEmpty) return <Box key={seat.id} sx={{ height: { xs: 48, md: 64 } }} />

    if (isDriver) {
      return (
        <Paper
          key={seat.id}
          elevation={0}
          sx={{
            height: { xs: 48, md: 64 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: 'warning.dark',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'warning.light',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 900 }}>DRIVER</Typography>
        </Paper>
      )
    }

    return (
      <Button
        key={seat.id}
        onClick={async () => {
          if (isBooked || isLockedByAnotherUser) return
          if (!isSelected && selectedSeats.length >= 6) {
            toast.error(`Limit: 6 seats`)
            return
          }
          
          // Optimistically toggle UI
          toggleSeat(seat)
          
          try {
            if (isSelected) {
              // Deselecting: unlock
              await unlockSeat(id, seat.label, sessionId)
            } else {
              // Selecting: lock
              const res = await lockSeats({
                tripId: id,
                seatLabels: [seat.label],
                sessionId
              })
              
              if (res.failed_seats.includes(seat.label)) {
                toast.error(`Seat ${seat.label} just got locked by someone else!`)
                toggleSeat(seat) // Revert
              }
            }
          } catch (err) {
            console.error('Seat locking error:', err)
            toast.error('Failed to lock seat.')
            toggleSeat(seat) // Revert on failure
          }
        }}
        disabled={isBooked || !!isLockedByAnotherUser}
        sx={{
          height: { xs: 48, md: 64 },
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          p: 0.5,
          textTransform: 'none',
          minWidth: 0,
          border: '1px solid',
          borderColor: isSelected ? 'primary.main' : isBooked ? 'divider' : isLockedByAnotherUser ? alpha(theme.palette.warning.main, 0.5) : 'divider',
          bgcolor: isSelected ? 'primary.main' : isBooked ? alpha(theme.palette.divider, 0.1) : isLockedByAnotherUser ? alpha(theme.palette.warning.main, 0.05) : 'background.paper',
          color: isSelected ? 'white' : isBooked ? 'text.disabled' : isLockedByAnotherUser ? 'warning.main' : 'text.primary',
          boxShadow: isSelected ? theme.shadows[4] : 'none',
          '&:hover': {
            bgcolor: isSelected ? 'primary.dark' : isBooked ? alpha(theme.palette.divider, 0.1) : isLockedByAnotherUser ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.primary.main, 0.05),
            borderColor: isSelected ? 'primary.dark' : 'divider',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 800 }}>{seat.label}</Typography>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
          {isLockedByAnotherUser ? 'Locked' : seat.type === 'sleeper' ? 'Sleep' : 'Sit'}
        </Typography>
      </Button>
    )
  }

  if (tripLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container sx={{ pt: 20, textAlign: 'center' }}>
          <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 4 }} />
          <Typography variant="h6">Loading trip details...</Typography>
        </Container>
      </Box>
    )
  }

  if (!trip) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container sx={{ pt: 20, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Trip Not Found</Typography>
          <Button component={Link} href="/search" variant="contained" sx={{ borderRadius: 4 }}>Back to Search</Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ pt: { xs: 12, md: 14 }, pb: 8 }}>
        <Stack spacing={4}>
          <Box>
            <Button
              component={Link}
              href="/search"
              startIcon={<ArrowLeft size={18} />}
              sx={{ mb: 2, color: 'text.secondary', fontWeight: 700 }}
            >
              Back to search results
            </Button>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>Select Your Seats</Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Seat Map */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={4}>
                  {hasUpperDeck && (
                    <ToggleButtonGroup
                      value={selectedDeck}
                      exclusive
                      onChange={(_, v) => v && setSelectedDeck(v)}
                      sx={{ width: 'fit-content' }}
                    >
                      <ToggleButton value="lower" sx={{ px: 3, py: 1, borderRadius: 3, fontWeight: 700 }}>Lower Deck</ToggleButton>
                      <ToggleButton value="upper" sx={{ px: 3, py: 1, borderRadius: 3, fontWeight: 700 }}>Upper Deck</ToggleButton>
                    </ToggleButtonGroup>
                  )}

                  <Box sx={{ position: 'relative', pt: 4 }}>
                    <Typography variant="caption" sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.2em' }}>
                      FRONT OF BUS →
                    </Typography>
                    
                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        p: 3,
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.divider, 0.02),
                        border: '2px solid',
                        borderColor: 'divider',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      }}
                    >
                      {selectedDeck === 'lower' 
                        ? lowerSeats.map(seat => renderSeat(seat))
                        : upperSeats.map(seat => renderSeat(seat))
                      }
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    {[
                      { label: 'Available', color: 'background.paper', border: 'divider' },
                      { label: 'Selected', color: 'primary.main', border: 'primary.main' },
                      { label: 'Locked', color: alpha(theme.palette.warning.main, 0.1), border: 'warning.light' },
                      { label: 'Booked', color: alpha(theme.palette.divider, 0.1), border: 'divider' },
                    ].map(item => (
                      <Grid key={item.label} size="auto">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 24, height: 24, borderRadius: 1.5, bgcolor: item.color, border: '1px solid', borderColor: item.border }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{item.label}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Paper>
            </Grid>

            {/* Side Info */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: 112 }}>
                {/* Trip Summary Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Trip Journey</Typography>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <BusIcon size={20} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BUS OPERATOR</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{trip.bus?.name}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                        <MapPin size={20} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ROUTE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{trip.route?.origin} → {trip.route?.destination}</Typography>
                      </Box>
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DEPARTURE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ARRIVAL</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(trip.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Selected Seats Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: selectedSeats.length > 0 ? 'primary.main' : 'divider',
                    bgcolor: selectedSeats.length > 0 ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: pricingBadge ? 1.5 : 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Booking Summary</Typography>
                    <Chip label={`${selectedSeats.length} Seats`} size="small" color="primary" sx={{ fontWeight: 800 }} />
                  </Stack>

                  {pricingBadge && (
                    <Chip
                      label={pricingBadge.label}
                      color={pricingBadge.color}
                      size="small"
                      sx={{ fontWeight: 800, mb: 3, fontSize: '0.75rem' }}
                    />
                  )}

                  {selectedSeats.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Select your preferred seats from the map to continue.</Typography>
                      {pricingResult && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15) }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>Starting From</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{effectivePrice.toLocaleString()}</Typography>
                          {pricingResult.discount_percentage !== 0 && (
                            <Typography variant="caption" sx={{ color: pricingResult.discount_percentage > 0 ? 'error.main' : 'success.main', fontWeight: 700 }}>
                              {pricingResult.discount_percentage > 0 ? `+${pricingResult.discount_percentage}%` : `${pricingResult.discount_percentage}%`} vs base price
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedSeats.map(seat => (
                          <Chip
                            key={seat.id}
                            label={`Seat ${seat.label}`}
                            size="small"
                            onDelete={() => toggleSeat(seat)}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          />
                        ))}
                      </Box>
                      <Divider />
                      {pricingResult && pricingResult.adjustment_reason !== 'Standard pricing' && (
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.2) }}>
                          <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 700 }}>
                            💡 {pricingResult.adjustment_reason}
                          </Typography>
                        </Box>
                      )}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Fare</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{calculateTotal().toLocaleString()}</Typography>
                          <Typography variant="caption" color="text.secondary">Incl. all taxes</Typography>
                        </Box>
                      </Stack>
                      <Button
                        onClick={handleProceedToCheckout}
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={selectedSeats.length === 0 || selectedSeats.length > 6}
                        endIcon={<ChevronRight size={18} />}
                        sx={{
                          py: 2,
                          borderRadius: 4,
                          fontWeight: 800,
                          boxShadow: theme.shadows[4],
                        }}
                      >
                        {selectedSeats.length === 0
                          ? `Select at least 1 seat` 
                          : 'Confirm Booking'}
                      </Button>
                    </Stack>
                  )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
