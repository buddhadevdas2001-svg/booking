'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Bus as BusIcon,
  Coffee,
  Power,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Wifi,
  Sun,
  CloudSun,
  Moon,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Slider,
  Radio,
  Chip,
  alpha,
  useTheme,
  Collapse,
  Skeleton,
} from '@mui/material'
import Navbar from '@/components/common/Navbar'
import { searchTrips } from '@/lib/api'
import type { SearchTrip } from '@/types/supabase'
import { calculateDynamicPrice, formatPrice } from '@/lib/pricing_engine'
import SearchModifier from '@/components/search/SearchModifier'
import DateStrip from '@/components/search/DateStrip'

function SearchContent() {
  const theme = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [filters, setFilters] = useState({
    busType: 'all',
    priceRange: [0, 5000],
    sortBy: 'departure_time',
    timeSlot: 'all',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isModifying, setIsModifying] = useState(false)

  const { data: trips, isLoading } = useQuery<SearchTrip[]>({
    queryKey: ['search-trips', from, to, date],
    queryFn: () => searchTrips({ from, to, date }),
  })

  const tripsWithPricing = useMemo(() => {
    return trips?.map((trip) => {
      const pricing = calculateDynamicPrice({
        base_price: Number(trip.base_price),
        departure_time: trip.departure_time,
        available_seats: Number(trip.available_seats),
        total_seats: Number(trip.total_seats),
      })
      return { ...trip, effective_price: pricing.effective_price, pricing }
    })
  }, [trips])

  const filteredTrips = useMemo(() => {
    return tripsWithPricing?.filter((trip) => {
      if (filters.busType !== 'all' && trip.bus?.bus_type !== filters.busType) return false
      if (trip.effective_price < filters.priceRange[0] || trip.effective_price > filters.priceRange[1]) return false
      if (filters.timeSlot !== 'all') {
        const hour = new Date(trip.departure_time).getHours()
        if (filters.timeSlot === 'morning' && (hour < 6 || hour >= 12)) return false
        if (filters.timeSlot === 'afternoon' && (hour < 12 || hour >= 18)) return false
        if (filters.timeSlot === 'evening' && (hour < 18 || hour >= 24)) return false
        if (filters.timeSlot === 'night' && (hour < 0 || hour >= 6)) return false
      }
      return true
    }).sort((a, b) => {
      if (filters.sortBy === 'price_low') return a.effective_price - b.effective_price
      if (filters.sortBy === 'price_high') return b.effective_price - a.effective_price
      if (filters.sortBy === 'departure_time') {
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      }
      return 0
    })
  }, [filters, tripsWithPricing])

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, typeof Wifi> = {
      WiFi: Wifi,
      'Charging Point': Power,
      'Water Bottle': Coffee,
      Blanket: Shield,
    }
    const Icon = icons[amenity] || Star
    return <Icon size={14} />
  }

  const activeFilterCount =
    Number(filters.busType !== 'all') +
    Number(filters.priceRange[1] < 5000) +
    Number(filters.sortBy !== 'departure_time') +
    Number(filters.timeSlot !== 'all')

  const handleUpdateParams = (newParams: { from: string; to: string; date: string }) => {
    const url = `/search?from=${encodeURIComponent(newParams.from)}&to=${encodeURIComponent(newParams.to)}&date=${newParams.date}`
    router.push(url)
    setIsModifying(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: { xs: 16, md: 20 }, pb: 8 }}>
        <Stack spacing={6}>

          {/* Hero Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha('#ffffff', 0.2),
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
              boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)',
            }}
          >
            <Box sx={{ position: 'absolute', top: -150, right: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.25)} 0%, transparent 70%)`, filter: 'blur(100px)', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`, filter: 'blur(80px)', zIndex: 0 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1, mt: 4, mb: 2 }}>
              <SearchModifier
                initialFrom={from}
                initialTo={to}
                initialDate={date}
                onUpdate={handleUpdateParams}
              />
            </Box>
          </Paper>

          {/* Date Strip */}
          <Box sx={{ py: 2 }}>
            <DateStrip
              selectedDate={date}
              onDateChange={(newDate) => handleUpdateParams({ from, to, date: newDate })}
            />
          </Box>

          {/* Centered Results Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ maxWidth: 960, width: '100%' }}>

              {/* Filter Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
                <Button
                  variant="outlined"
                  startIcon={<SlidersHorizontal size={18} />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    borderRadius: 100,
                    px: 5,
                    py: 1.2,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Filters &amp; Sorting {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </Box>

              {/* Expandable Filters */}
              <Collapse in={showFilters}>
                <Box sx={{ mb: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 5,
                      borderRadius: 5,
                      border: '1px solid',
                      borderColor: alpha('#000', 0.08),
                      bgcolor: 'background.paper',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Grid container spacing={5}>
                      {/* Time Slots */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 2, display: 'block', color: 'primary.main', letterSpacing: '0.12em' }}>
                          Time Preference
                        </Typography>
                        <Stack spacing={1}>
                          {[
                            { id: 'morning', label: 'Morning', icon: <Sun size={15} />, time: '6am – 12pm' },
                            { id: 'afternoon', label: 'Afternoon', icon: <CloudSun size={15} />, time: '12pm – 6pm' },
                            { id: 'evening', label: 'Evening', icon: <Moon size={15} />, time: '6pm – 12am' },
                            { id: 'night', label: 'Night', icon: <Zap size={15} />, time: '12am – 6am' },
                          ].map((slot) => {
                            const isActive = filters.timeSlot === slot.id
                            return (
                              <Box
                                key={slot.id}
                                onClick={() => setFilters(prev => ({ ...prev, timeSlot: isActive ? 'all' : slot.id }))}
                                sx={{
                                  p: 1.8, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2,
                                  cursor: 'pointer', transition: 'all 0.2s', border: '2px solid',
                                  borderColor: isActive ? 'primary.main' : 'transparent',
                                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : alpha('#000', 0.02),
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                }}
                              >
                                <Box sx={{ color: isActive ? 'primary.main' : 'text.secondary' }}>{slot.icon}</Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{slot.label}</Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{slot.time}</Typography>
                                </Box>
                              </Box>
                            )
                          })}
                        </Stack>
                      </Grid>

                      {/* Sort */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 2, display: 'block', color: 'primary.main', letterSpacing: '0.12em' }}>
                          Sort By
                        </Typography>
                        <Stack spacing={1}>
                          {[
                            { value: 'departure_time', label: 'Earliest Departure' },
                            { value: 'price_low', label: 'Best Price First' },
                            { value: 'rating', label: 'Top Rated' },
                          ].map((option) => (
                            <Box
                              key={option.value}
                              onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                              sx={{
                                p: 2, borderRadius: 3, display: 'flex', alignItems: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', border: '2px solid',
                                borderColor: filters.sortBy === option.value ? 'primary.main' : 'transparent',
                                bgcolor: filters.sortBy === option.value ? alpha(theme.palette.primary.main, 0.06) : alpha('#000', 0.02),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                              }}
                            >
                              <Radio value={option.value} checked={filters.sortBy === option.value} size="small" sx={{ p: 0, mr: 2 }} />
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>{option.label}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Grid>

                      {/* Bus Type + Price */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="overline" sx={{ fontWeight: 900, mb: 2, display: 'block', color: 'primary.main', letterSpacing: '0.12em' }}>
                            Bus Type
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['all', 'AC Seater', 'AC Sleeper', 'Non-AC Seater', 'Non-AC Sleeper'].map((type) => (
                              <Chip
                                key={type}
                                label={type === 'all' ? 'All' : type}
                                onClick={() => setFilters(prev => ({ ...prev, busType: type }))}
                                color={filters.busType === type ? 'primary' : 'default'}
                                sx={{ fontWeight: 700, borderRadius: 2 }}
                              />
                            ))}
                          </Stack>
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '0.12em' }}>Max Fare</Typography>
                            <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>₹{filters.priceRange[1]}</Typography>
                          </Box>
                          <Slider
                            value={filters.priceRange[1]}
                            min={0} max={5000} step={100}
                            onChange={(_, value) => setFilters(prev => ({ ...prev, priceRange: [0, value as number] }))}
                            sx={{ color: 'primary.main' }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Collapse>

              {/* Results Header */}
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.03em' }}>
                    {isLoading ? 'Searching...' : `${filteredTrips?.length || 0} Trips Found`}
                  </Typography>
                  {!isLoading && filteredTrips && filteredTrips.length > 0 && (
                    <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Live
                    </Box>
                  )}
                </Stack>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.8 }}>
                  {from && to ? `${from} → ${to}` : 'All available routes'}
                </Typography>
              </Box>

              {/* Trip Cards */}
              {isLoading ? (
                <Stack spacing={3}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 4 }} />
                  ))}
                </Stack>
              ) : !filteredTrips || filteredTrips.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, borderRadius: 4, border: '2px dashed', borderColor: 'divider', textAlign: 'center' }}>
                  <Box sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 3 }}>
                    <Search size={40} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>No buses found</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Try adjusting your filters or searching a different date.</Typography>
                  <Button variant="contained" onClick={() => window.history.back()} sx={{ borderRadius: 3, px: 4 }}>Go Back</Button>
                </Paper>
              ) : (
                <Stack spacing={3}>
                  {filteredTrips.map((trip) => {
                    const isDeparted = new Date(trip.departure_time) <= new Date()
                    const durationMins = trip.route?.estimated_duration_minutes || 0
                    const durationStr = `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                    return (
                      <Box
                        key={trip.id}
                        sx={{
                          position: 'relative',
                          borderRadius: 4,
                          overflow: 'hidden',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: isDeparted ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.divider, 0.6),
                          opacity: isDeparted ? 0.75 : 1,
                          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          '&:hover': isDeparted ? {} : {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 20px 40px rgba(37,99,235,0.1)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        {/* Left accent bar */}
                        <Box sx={{
                          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                          background: isDeparted ? theme.palette.error.main : 'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)',
                        }} />

                        <Box sx={{ pl: 4, pr: 3, py: 3 }}>
                          <Grid container spacing={3} alignItems="center">

                            {/* Operator */}
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', flexShrink: 0 }}>
                                  <BusIcon size={24} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.3 }}>
                                    {trip.bus?.name}
                                  </Typography>
                                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#22c55e', borderRadius: 1, px: 0.8, py: 0.15, mt: 0.5 }}>
                                    <Star size={9} style={{ color: '#fff', fill: '#fff' }} />
                                    <Typography sx={{ color: '#fff', fontSize: '0.68rem', fontWeight: 800 }}>4.6</Typography>
                                  </Box>
                                </Box>
                              </Stack>
                            </Grid>

                            {/* Journey */}
                            <Grid size={{ xs: 12, md: 5 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ textAlign: 'center', minWidth: 72 }}>
                                  <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                    {new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {trip.route?.origin}
                                  </Typography>
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                  <Stack alignItems="center" spacing={0.5}>
                                    <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
                                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                                      <Box sx={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }} />
                                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'secondary.main', flexShrink: 0 }} />
                                    </Stack>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                                      {durationStr} · NON-STOP
                                    </Typography>
                                  </Stack>
                                </Box>

                                <Box sx={{ textAlign: 'center', minWidth: 72 }}>
                                  <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                    {new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {trip.route?.destination}
                                  </Typography>
                                </Box>
                              </Stack>

                              {/* Amenities */}
                              <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                                {trip.bus?.amenities?.slice(0, 4).map((amenity: string) => (
                                  <Box key={amenity} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600 }}>
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Box>
                                ))}
                              </Stack>
                            </Grid>

                            {/* Price & CTA */}
                            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.3 }}>
                                Price starts at
                              </Typography>
                              <Typography sx={{ fontWeight: 900, fontSize: '1.9rem', lineHeight: 1, letterSpacing: '-0.03em', mb: 2, color: 'text.primary' }}>
                                {formatPrice(trip.effective_price)}
                              </Typography>
                              <Button
                                component={Link}
                                href={`/book/${trip.id}`}
                                variant="contained"
                                disabled={isDeparted}
                                fullWidth
                                sx={{
                                  borderRadius: 3, fontWeight: 800, py: 1.4,
                                  textTransform: 'none', fontSize: '0.95rem',
                                  background: isDeparted ? alpha(theme.palette.error.main, 0.1) : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                                  color: isDeparted ? 'error.main' : '#fff',
                                  boxShadow: isDeparted ? 'none' : '0 8px 20px rgba(37,99,235,0.25)',
                                  '&:hover': {
                                    background: isDeparted ? alpha(theme.palette.error.main, 0.15) : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                                    transform: isDeparted ? 'none' : 'translateY(-2px)',
                                    boxShadow: isDeparted ? 'none' : '0 12px 28px rgba(37,99,235,0.35)',
                                  },
                                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                }}
                              >
                                {isDeparted ? 'Departed' : 'Select Seat →'}
                              </Button>
                            </Grid>

                          </Grid>
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              )}

            </Box>
          </Box>

        </Stack>
      </Container>
    </Box>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Skeleton variant="circular" width={60} height={60} />
      </Box>
    }>
      <SearchContent />
    </Suspense>
  )
}
