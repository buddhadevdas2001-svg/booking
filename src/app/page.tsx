'use client'

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Divider,
  Paper,
  Stack,
  alpha,
  useTheme,
  Grid,
  Chip,
  Skeleton,
} from '@mui/material'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Gift,
  Mail,
  MapPin,
  Percent,
  Phone,
  Search,
  Tag,
  Users,
  ChevronRight,
  Shield,
  Wifi,
  Star,
  Bus as BusIcon,
  Zap,
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import Brand from '@/components/common/Brand'
import { getCities, getPopularRoutes, getOffers } from '@/lib/api'
import type { Route, Coupon } from '@/types/supabase'

const OFFER_GRADIENTS = [
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
]
const OFFER_ICONS = [Percent, Gift, Tag]

function formatDuration(minutes?: number | null) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export default function HomePage() {
  const router = useRouter()
  const theme = useTheme()

  const [cities, setCities] = useState<string[]>([])
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([])
  const [offers, setOffers] = useState<Coupon[]>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [loadingOffers, setLoadingOffers] = useState(true)

  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
  })
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    getCities()
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false))

    getPopularRoutes()
      .then(setPopularRoutes)
      .catch(() => setPopularRoutes([]))
      .finally(() => setLoadingRoutes(false))

    getOffers()
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoadingOffers(false))
  }, [])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    if (!searchParams.from || !searchParams.to || !searchParams.date) return
    setIsSearching(true)
    router.push(
      `/search?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${searchParams.date}&passengers=${searchParams.passengers}`
    )
  }

  const stats = [
    { value: '1M+', label: 'Happy Passengers', icon: Users },
    { value: '500+', label: 'Routes Covered', icon: MapPin },
    { value: '99.2%', label: 'On-time Rate', icon: Shield },
    { value: '4.8★', label: 'Average Rating', icon: Star },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 12, md: 16 },
          pb: { xs: 10, md: 14 },
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, #5b21b6 100%)`,
          overflow: 'hidden',
          color: 'white',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', bgcolor: alpha('#fff', 0.05), filter: 'blur(80px)' }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: alpha('#fff', 0.04), filter: 'blur(60px)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Chip
              label="🚌 India's Most Trusted Bus Booking Platform"
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: 'white',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                borderRadius: 8,
                fontSize: { xs: '0.7rem', md: '0.85rem' },
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                lineHeight: 1.1,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              Travel Smarter,{' '}
              <Box component="span" sx={{ color: '#fcd34d' }}>
                Book Faster
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 680,
                color: alpha('#fff', 0.85),
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Safe, comfortable, and convenient bus travel across India. Real-time seat selection,
              live pricing, and instant e-tickets.
            </Typography>
          </Stack>

          {/* Search Form */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={24}
            sx={{
              mt: 8,
              p: { xs: 3, lg: 4 },
              borderRadius: 8,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr auto' },
              gap: 3,
              alignItems: 'end',
              background: 'white',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={16} /> From
              </Typography>
              <TextField
                fullWidth
                select
                value={searchParams.from}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, from: e.target.value }))}
                placeholder="Select city"
                slotProps={{ input: { sx: { borderRadius: 4 } } }}
                disabled={loadingCities}
              >
                {loadingCities
                  ? <MenuItem value="" disabled>Loading cities…</MenuItem>
                  : cities.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)
                }
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={16} /> To
              </Typography>
              <TextField
                fullWidth
                select
                value={searchParams.to}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, to: e.target.value }))}
                placeholder="Select city"
                slotProps={{ input: { sx: { borderRadius: 4 } } }}
                disabled={loadingCities}
              >
                {loadingCities
                  ? <MenuItem value="" disabled>Loading cities…</MenuItem>
                  : cities.filter(c => c !== searchParams.from).map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)
                }
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarDays size={16} /> Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, date: e.target.value }))}
                slotProps={{
                  input: { sx: { borderRadius: 4 }, inputProps: { min: new Date().toISOString().split('T')[0] } },
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Users size={16} /> Passengers
              </Typography>
              <TextField
                fullWidth
                select
                value={searchParams.passengers}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, passengers: e.target.value }))}
                slotProps={{ input: { sx: { borderRadius: 4 } } }}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num.toString()}>
                    {num} Passenger{num > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSearching}
              sx={{
                height: 56,
                borderRadius: 4,
                px: 4,
                fontSize: '1.05rem',
                fontWeight: 800,
                boxShadow: theme.shadows[10],
                '&:hover': { bgcolor: theme.palette.secondary.dark },
              }}
              startIcon={<Search size={20} />}
            >
              {isSearching ? 'Searching…' : 'Search'}
            </Button>
          </Paper>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mt: 6 }}>
            {stats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
                <Stack alignItems="center" spacing={1}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha('#fff', 0.15), color: 'white' }}>
                    <stat.icon size={22} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.75), fontWeight: 600 }}>{stat.label}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Popular Routes */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
          <Chip label="Most Booked" color="primary" size="small" sx={{ fontWeight: 700 }} />
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900 }}>
            Popular Routes
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 400 }}>
            Book tickets for the most traveled routes across India
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {loadingRoutes
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
                </Grid>
              ))
            : popularRoutes.length === 0
            ? (
              <Grid size={12}>
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 6, border: '2px dashed', borderColor: 'divider' }}>
                  <BusIcon size={48} style={{ color: theme.palette.text.disabled, marginBottom: 16 }} />
                  <Typography variant="h6" color="text.secondary">No popular routes found. Add routes in the admin panel.</Typography>
                </Paper>
              </Grid>
            )
            : popularRoutes.map((route) => (
                <Grid key={route.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: theme.shadows[12],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          <BusIcon size={20} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                          {route.origin}
                        </Typography>
                        <ArrowRight size={20} color={theme.palette.primary.main} />
                        <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                          {route.destination}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, color: 'text.secondary' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Clock3 size={16} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDuration(route.estimated_duration_minutes)}
                          </Typography>
                        </Stack>
                        {route.distance_km && (
                          <Chip
                            label={`${Number(route.distance_km).toFixed(0)} km`}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>

                      <Divider sx={{ mb: 3, opacity: 0.6 }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                        <Box>
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary' }}>
                            Starting from
                          </Typography>
                          <Typography variant="h3" color="primary" sx={{ fontWeight: 900 }}>
                            ₹299
                          </Typography>
                        </Box>
                        <Button
                          component={Link}
                          href={`/search?from=${route.origin}&to=${route.destination}&date=${new Date().toISOString().split('T')[0]}`}
                          variant="text"
                          color="primary"
                          endIcon={<ChevronRight size={18} />}
                          sx={{ fontWeight: 800 }}
                        >
                          Book Now
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))
          }
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: { xs: 10, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Chip label="Why Choose Us" color="secondary" size="small" sx={{ fontWeight: 700 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900 }}>
              Travel with Confidence
            </Typography>
          </Stack>
          <Grid container spacing={4}>
            {[
              { icon: Zap, title: 'Real-Time Seat Locking', desc: 'Your selected seats are locked instantly for 5 minutes, preventing double bookings from concurrent users.', color: 'warning' },
              { icon: Shield, title: 'Secure Stripe Payments', desc: 'Pay securely using cards, UPI or net banking. Your payment data is never stored on our servers.', color: 'success' },
              { icon: Star, title: 'Instant E-Ticket', desc: 'Receive your ticket with a QR code immediately after payment. Board directly — no printout needed.', color: 'primary' },
              { icon: Wifi, title: 'Live Bus Tracking', desc: 'Get real-time updates on your bus location and estimated arrival so you never miss a departure.', color: 'secondary' },
            ].map((feature) => (
              <Grid key={feature.title} size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8], borderColor: `${feature.color}.main` },
                  }}
                >
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette[feature.color as 'primary'].main, 0.1), color: `${feature.color}.main`, width: 'fit-content', mb: 3 }}>
                    <feature.icon size={24} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{feature.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Special Offers */}
      {(loadingOffers || offers.length > 0) && (
        <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Chip label="Limited Time" color="error" size="small" sx={{ fontWeight: 700 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900 }}>
              Special Offers
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 400 }}>
              Save more on your bus bookings with our exclusive deals
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {loadingOffers
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="rounded" height={240} sx={{ borderRadius: 6 }} />
                  </Grid>
                ))
              : offers.map((offer, idx) => {
                  const Icon = OFFER_ICONS[idx % OFFER_ICONS.length]
                  const gradient = OFFER_GRADIENTS[idx % OFFER_GRADIENTS.length]
                  return (
                    <Grid key={offer.id} size={{ xs: 12, md: 4 }}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden', borderRadius: 6 }}>
                        <Box sx={{ p: 4, background: gradient, color: 'white', flexGrow: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)' }}>
                              <Icon size={32} />
                            </Box>
                            <Paper sx={{ px: 2, py: 0.5, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                              {offer.discount_type === 'percentage' ? `Up to ${offer.discount_value}% off` : `Save ₹${offer.discount_value}`}
                            </Paper>
                          </Stack>
                          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                            {offer.code}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha('#fff', 0.9), fontWeight: 500 }}>
                            {offer.description || 'Exclusive discount for you'}
                          </Typography>
                          {offer.valid_until && (
                            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), mt: 1, display: 'block' }}>
                              Valid till {new Date(offer.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800 }}
                            onClick={() => {
                              navigator.clipboard?.writeText(offer.code)
                            }}
                          >
                            Copy Code
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  )
                })
            }
          </Grid>
        </Container>
      )}

      {/* Footer */}
      <Box sx={{ bgcolor: '#0b1120', color: 'white', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Brand dark compact={false} href="/" className="mb-4" />
              <Typography variant="body2" sx={{ color: 'grey.400', lineHeight: 1.8, pr: { md: 4 }, mt: 3, fontWeight: 400 }}>
                Your trusted partner for safe and comfortable bus travel across India. Book with confidence, travel with ease, and experience the next generation of transportation.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                  <Box
                    key={social}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'white' }}>
                      {social[0]}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, fontSize: '1.1rem' }}>Quick Links</Typography>
              <Stack spacing={2}>
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Book a Trip', href: '/search' },
                  { label: 'My Bookings', href: '/dashboard/bookings' },
                  { label: 'Contact Us', href: '/contact' }
                ].map((link) => (
                  <Box
                    key={link.label}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'primary.light' }
                    }}
                  >
                    {link.label}
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, fontSize: '1.1rem' }}>Support</Typography>
              <Stack spacing={2}>
                {[
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Refund Policy', href: '/refunds' }
                ].map((link) => (
                  <Box
                    key={link.label}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'primary.light' }
                    }}
                  >
                    {link.label}
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, fontSize: '1.1rem' }}>Contact</Typography>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'primary.light' }}>
                    <Phone size={18} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Call Us</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'grey.300' }}>+91 1800 123 4567</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'primary.light' }}>
                    <Mail size={18} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'grey.300' }}>support@voyatra.com</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
          
          <Divider sx={{ mt: 8, mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 500 }}>
              © {new Date().getFullYear()} Voyatra Travel Club. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3} sx={{ color: 'grey.600', '& > *:hover': { color: 'white', cursor: 'pointer' } }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Privacy</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Terms</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Sitemap</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
