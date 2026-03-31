'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import Lottie from 'lottie-react'
import {
  ArrowRight,
  Bus as BusIcon,
  Calendar,
  Coffee,
  Filter,
  MapPin,
  Power,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Wifi,
  ChevronLeft,
} from 'lucide-react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Slider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  alpha,
  useTheme,
  Divider,
  Collapse,
  Skeleton,
} from '@mui/material'
import Navbar from '@/components/common/Navbar'
import { searchTrips } from '@/lib/api'

function SearchContent() {
  const theme = useTheme()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const date = searchParams.get('date') || ''
  const passengers = searchParams.get('passengers') || '1'

  const [filters, setFilters] = useState({
    busType: 'all',
    priceRange: [0, 5000],
    sortBy: 'departure_time',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    fetch('https://assets7.lottiefiles.com/packages/lf20_tutvdkg0.json')
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null))
  }, [])

  const { data: trips, isLoading } = useQuery({
    queryKey: ['search-trips', from, to, date],
    queryFn: () => searchTrips({ from, to, date }),
  })

  const filteredTrips = useMemo(() => {
    return trips?.filter((trip: any) => {
      if (filters.busType !== 'all' && trip.bus?.bus_type !== filters.busType) return false
      if (trip.base_price < filters.priceRange[0] || trip.base_price > filters.priceRange[1]) return false
      return true
    }).sort((a: any, b: any) => {
      if (filters.sortBy === 'price_low') return a.base_price - b.base_price
      if (filters.sortBy === 'price_high') return b.base_price - a.base_price
      if (filters.sortBy === 'departure_time') {
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      }
      return 0
    })
  }, [filters, trips])

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

  const activeFilterCount = Number(filters.busType !== 'all') + Number(filters.priceRange[1] < 5000) + Number(filters.sortBy !== 'departure_time')

  const formatDateDisplay = (value?: string) => {
    if (!value) return 'All dates'
    const dateParts = value.split('-')
    if (dateParts.length !== 3) return value
    return `${dateParts[2].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[0]}`
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ pt: { xs: 12, md: 14 }, pb: 8 }}>
        <Stack spacing={4}>
          {/* Header Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 8,
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                filter: 'blur(80px)',
              }}
            />
            
            <Grid container spacing={4} alignItems="flex-end">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'inline-flex', px: 2, py: 0.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', typography: 'caption', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                      Search Results
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}>
                      {from || 'Anywhere'} <Box component="span" sx={{ color: 'text.secondary', mx: 1 }}>→</Box> {to || 'Anywhere'}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<MapPin size={16} />}
                        label={from || 'Origin'}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      />
                      <Chip
                        icon={<MapPin size={16} />}
                        label={to || 'Destination'}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      />
                      <Chip
                        icon={<Calendar size={16} />}
                        label={formatDateDisplay(date)}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                    Compare departure times, bus types, seat availability, and amenities. Book your perfect trip in just a few clicks.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<SlidersHorizontal size={18} />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ display: { lg: 'none' }, borderRadius: 4, px: 3, py: 1.5, fontWeight: 700 }}
                  >
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </Button>
                  <Button
                    component={Link}
                    href="/"
                    variant="contained"
                    startIcon={<ChevronLeft size={18} />}
                    sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 800, boxShadow: theme.shadows[4] }}
                  >
                    Modify Search
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={4}>
            {/* Sidebar Filters */}
            <Grid size={{ xs: 12, lg: 3 }}>
              <Collapse in={showFilters} sx={{ display: { lg: 'block' } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: 'divider',
                    position: { lg: 'sticky' },
                    top: 100,
                  }}
                >
                  <Stack spacing={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Filters
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setFilters({ busType: 'all', priceRange: [0, 5000], sortBy: 'departure_time' })}
                        sx={{ fontWeight: 700 }}
                      >
                        Reset
                      </Button>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Sort By
                      </Typography>
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={filters.sortBy}
                          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        >
                          <Stack spacing={1}>
                            {[
                              { value: 'departure_time', label: 'Departure Time' },
                              { value: 'price_low', label: 'Price: Low to High' },
                              { value: 'price_high', label: 'Price: High to Low' },
                            ].map((option) => (
                              <Paper
                                key={option.value}
                                variant="outlined"
                                sx={{
                                  borderRadius: 3,
                                  borderColor: filters.sortBy === option.value ? 'primary.main' : 'divider',
                                  bgcolor: filters.sortBy === option.value ? alpha(theme.palette.primary.main, 0.02) : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': { bgcolor: alpha(theme.palette.divider, 0.05) },
                                }}
                              >
                                <FormControlLabel
                                  value={option.value}
                                  control={<Radio color="primary" size="small" />}
                                  label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>}
                                  sx={{ width: '100%', m: 0, px: 2, py: 1 }}
                                />
                              </Paper>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Bus Type
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {['all', 'AC Seater', 'AC Sleeper', 'Non-AC Seater', 'Non-AC Sleeper'].map((type) => (
                          <Chip
                            key={type}
                            label={type === 'all' ? 'All Types' : type}
                            onClick={() => setFilters(prev => ({ ...prev, busType: type }))}
                            color={filters.busType === type ? 'primary' : 'default'}
                            variant={filters.busType === type ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Max Fare
                        </Typography>
                        <Chip
                          label={`₹${filters.priceRange[1]}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 800, borderRadius: 1 }}
                        />
                      </Box>
                      <Box sx={{ px: 1 }}>
                        <Slider
                          value={filters.priceRange[1]}
                          min={0}
                          max={5000}
                          step={100}
                          onChange={(_, value) => setFilters(prev => ({ ...prev, priceRange: [0, value as number] }))}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">₹0</Typography>
                        <Typography variant="caption" color="text.secondary">₹5,000</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Collapse>
            </Grid>

            {/* Results Section */}
            <Grid size={{ xs: 12, lg: 9 }}>
              <Stack spacing={3}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {isLoading ? 'Searching...' : `${filteredTrips?.length || 0} Ships Found`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available trips for your selected route and date.
                  </Typography>
                </Box>

                {isLoading ? (
                  <Stack spacing={3}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rectangular" height={220} sx={{ borderRadius: 6 }} />
                    ))}
                  </Stack>
                ) : filteredTrips?.length === 0 ? (
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
                        p: 3,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        mb: 3,
                      }}
                    >
                      <Search size={40} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                      No buses found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                      We couldn't find any buses matching your search. Try adjusting your filters or search for a different date.
                    </Typography>
                    <Button variant="contained" size="large" onClick={() => window.history.back()} sx={{ borderRadius: 4, px: 4 }}>
                      Go Back
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={3}>
                    {filteredTrips?.map((trip: any) => (
                      <Paper
                        key={trip.id}
                        elevation={0}
                        sx={{
                          borderRadius: 8,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          overflow: 'hidden',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8],
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Grid container>
                          <Grid size={{ xs: 12, md: 8 }} sx={{ p: { xs: 3, sm: 4 } }}>
                            <Stack spacing={3}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }} noWrap>
                                      {trip.bus?.name}
                                    </Typography>
                                    <Chip
                                      label={trip.bus?.bus_type}
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: '0.65rem',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: 'primary.main',
                                        letterSpacing: '0.05em',
                                      }}
                                    />
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {trip.available_seats} seats available
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark' }}>
                                  <Star size={16} fill="currentColor" />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>4.8</Typography>
                                </Box>
                              </Box>

                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 3,
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.divider, 0.02),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box>
                                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                    {new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    {trip.route?.origin}
                                  </Typography>
                                </Box>

                                <Stack alignItems="center" spacing={0.5} sx={{ flex: 1, px: 4 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.1em' }}>
                                    {trip.route?.estimated_duration_minutes} MIN
                                  </Typography>
                                  <Box sx={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                    <Divider sx={{ flex: 1, borderStyle: 'dashed', mx: 1 }} />
                                    <BusIcon size={18} style={{ color: alpha(theme.palette.text.secondary, 0.5) }} />
                                    <Divider sx={{ flex: 1, borderStyle: 'dashed', mx: 1 }} />
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />
                                  </Box>
                                </Stack>

                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                    {new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    {trip.route?.destination}
                                  </Typography>
                                </Box>
                              </Paper>

                              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                {trip.bus?.amenities?.slice(0, 4).map((amenity: string) => (
                                  <Box
                                    key={amenity}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 2,
                                      bgcolor: alpha(theme.palette.divider, 0.05),
                                      color: 'text.secondary',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Box>
                                ))}
                              </Stack>
                            </Stack>
                          </Grid>

                          <Grid
                            size={{ xs: 12, md: 4 }}
                            sx={{
                              p: { xs: 3, sm: 4 },
                              bgcolor: alpha(theme.palette.divider, 0.03),
                              borderLeft: { md: '1px solid' },
                              borderColor: { md: 'divider' },
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: { xs: 'flex-start', md: 'center' },
                              textAlign: { md: 'center' },
                            }}
                          >
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Starting Fare
                              </Typography>
                              <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                ₹{Number(trip.base_price).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mt: 0.5 }}>
                                {trip.available_seats} seats left
                              </Typography>
                            </Box>

                            <Button
                              component={Link}
                              href={`/book/${trip.id}?passengers=${passengers}`}
                              variant="contained"
                              size="large"
                              fullWidth
                              endIcon={<ArrowRight size={18} />}
                              sx={{
                                borderRadius: 4,
                                py: 1.8,
                                fontWeight: 800,
                                boxShadow: theme.shadows[4],
                                '&:hover': { boxShadow: theme.shadows[10] },
                              }}
                            >
                              Select Seats
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>
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
