'use client'

import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  alpha,
  useTheme,
  Grid,
  Chip,
  IconButton,
  type Theme,
} from '@mui/material'
import {
  ArrowRight,
  Clock3,
  Gift,
  Mail,
  MapPin,
  Percent,
  Phone,
  Search,
  Tag,
  Users,
  Shield,
  Wifi,
  Star,
  Bus as BusIcon,
  Zap,
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import Brand from '@/components/common/Brand'
import HomeSearchForm from './HomeSearchForm'
import type { Route, Coupon } from '@/types/supabase'
import toast from 'react-hot-toast'

const OFFER_GRADIENTS = [
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
]
const OFFER_ICONS = [Percent, Gift, Tag]

const HERO_GRADIENT = (theme: Theme) => theme.palette.mode === 'dark' 
  ? `linear-gradient(225deg, ${alpha(theme.palette.primary.main, 1)} 0%, ${alpha('#000', 1)} 100%)`
  : `linear-gradient(225deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`

interface HomeContentProps {
  cities: string[]
  popularRoutes: Route[]
  offers: Coupon[]
}

export default function HomeContent({ cities, popularRoutes, offers }: HomeContentProps) {
  const theme = useTheme()

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
      <Box sx={{ 
        position: 'relative', 
        minHeight: { xs: 'auto', md: '85vh' },
        display: 'flex',
        alignItems: 'center',
        background: HERO_GRADIENT(theme),
        overflow: 'hidden',
        pt: { xs: 12, md: 10 },
        pb: { xs: 10, md: 0 }
      }}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={4}>
                <Box>
                  <Chip 
                    label="New: Express Routes Now Live" 
                    color="secondary" 
                    sx={{ 
                      fontWeight: 700, mb: 3, px: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.2),
                      color: theme.palette.secondary.main,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                    }} 
                  />
                  <Typography variant="h1" sx={{ 
                    color: 'white', 
                    fontSize: { xs: '3rem', md: '4.5rem' }, 
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 2,
                    letterSpacing: '-0.02em'
                  }}>
                    Travel Beyond <br />
                    <span style={{ color: theme.palette.secondary.main }}>Expectations.</span>
                  </Typography>
                  <Typography variant="h5" sx={{ color: alpha('#fff', 0.8), maxWidth: 550, fontWeight: 400, lineHeight: 1.6 }}>
                    Book premium bus travel across 500+ routes with Voyatra&apos;s state-of-the-art booking platform. <strong>Daily service available on all major routes.</strong>
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" size="large" color="secondary"
                    component={Link} href="/search"
                    endIcon={<ArrowRight />}
                    sx={{ px: 4, py: 2, borderRadius: 1, fontSize: '1.1rem', fontWeight: 800 }}
                  >
                    Find Your Trip
                  </Button>
                  <Button 
                    variant="outlined" size="large" 
                    sx={{ color: 'white', borderColor: alpha('#fff', 0.3), px: 4, py: 2, borderRadius: 1, '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.05) } }}
                  >
                    View Routes
                  </Button>
                </Stack>
                
                <Grid container spacing={3} sx={{ mt: 4 }} justifyContent="center">
                  {stats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>{stat.value}</Typography>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>

            {/* Search Card */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <HomeSearchForm cities={cities} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Popular Routes */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
          <Chip label="Most Booked" color="primary" size="small" sx={{ fontWeight: 700 }} />
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 900 }}>
            Popular Routes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, fontSize: '1.1rem' }}>
            Book tickets for the most traveled routes across India
          </Typography>
        </Stack>

        <Grid container spacing={4} justifyContent="center">
          {popularRoutes.slice(0, 4).map((route, idx) => (
            <Grid key={route.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                component={Link}
                href={`/search?from=${route.origin}&to=${route.destination}`}
                sx={{
                  height: '100%', display: 'flex', flexDirection: 'column', p: 0, borderRadius: 1,
                  textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid', borderColor: 'divider',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`, borderColor: 'primary.main' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          <MapPin size={18} />
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 800 }}>{route.origin}</Typography>
                      </Stack>
                      <Box sx={{ ml: 2, borderLeft: '2px dashed', borderColor: 'divider', height: 20 }} />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.dark }}>
                          <MapPin size={18} />
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 800 }}>{route.destination}</Typography>
                      </Stack>
                    </Stack>
                    <Divider sx={{ opacity: 0.6 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                         <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>FROM</Typography>
                         <Typography variant="h6" color="primary.main" sx={{ fontWeight: 900 }}>₹{Number(route.min_price || 0).toLocaleString()}</Typography>
                      </Box>
                      <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <ArrowRight size={20} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: { xs: 10, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
            <Chip label="Why Choose Us" color="secondary" size="small" sx={{ fontWeight: 700 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900 }}>
              Travel with Confidence
            </Typography>
          </Stack>
          <Grid container spacing={4} justifyContent="center">
            {[
              { icon: Zap, title: 'Real-Time Selection', desc: 'Secure your favorite platform seats instantly with our live interactive bus mapping system.', color: 'warning' },
              { icon: Shield, title: 'Secure Payments', desc: 'Industry-standard encryption for all your transactions. Your security is our top priority.', color: 'success' },
              { icon: Star, title: 'Instant Booking', desc: 'Get your digital tickets with QR codes immediately after confirming your payment.', color: 'primary' },
              { icon: Wifi, title: 'Live Tracking', desc: 'Track your bus in real-time and share your trip progress with friends and family.', color: 'secondary' },
            ].map((feature) => (
              <Grid key={feature.title} size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8], borderColor: `${feature.color}.main` },
                  }}
                >
                  <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette[feature.color as 'primary'].main, 0.1), color: `${feature.color}.main`, width: 'fit-content', mb: 3 }}>
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

      {/* Offers Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
          <Box sx={{ px: 2, py: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Limited Time Deals
          </Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 900 }}>
            Special Offers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, fontSize: '1.1rem' }}>
            We&apos;ve partnered with the best operators to bring you exclusive discounts.
          </Typography>
        </Stack>

        <Grid container spacing={4} justifyContent="center">
          {offers.length > 0 ? offers.map((offer, idx) => {
            const Icon = OFFER_ICONS[idx % OFFER_ICONS.length]
            const gradient = OFFER_GRADIENTS[idx % OFFER_GRADIENTS.length]
            const discountLabel = offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`
            return (
              <Grid key={offer.id} size={{ xs: 12, md: 4 }}>
                <Card sx={{ 
                  height: '100%', display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden', borderRadius: 1,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.02)' }
                }}>
                  <Box sx={{ p: 4, background: gradient, color: 'white', flexGrow: 1, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}><Icon size={120} /></Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4, position: 'relative' }}>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}><Icon size={28} /></Box>
                      <Chip label={discountLabel} sx={{ bgcolor: 'white', fontWeight: 900, color: '#333' }} />
                    </Stack>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>{offer.code}</Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), fontWeight: 500, mb: 3 }}>{offer.description}</Typography>
                    {offer.valid_until && (
                      <Stack direction="row" spacing={1} alignItems="center">
                          <Clock3 size={14} style={{ opacity: 0.7 }} />
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), fontWeight: 600 }}>Expiring {new Date(offer.valid_until).toLocaleDateString()}</Typography>
                      </Stack>
                    )}
                  </Box>
                  <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff' }}>
                    <Button
                      fullWidth variant="contained" color="inherit"
                      sx={{ py: 1.5, borderRadius: 1, fontWeight: 800, bgcolor: alpha(theme.palette.text.primary, 0.05) }}
                      onClick={() => {
                        navigator.clipboard?.writeText(offer.code)
                        toast.success('Code copied to clipboard!')
                      }}
                    >
                      Copy Promo Code
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )
          }) : (
            <Typography variant="body1" color="text.secondary">No active offers at the moment. Check back soon!</Typography>
          )}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0b1120', color: 'white', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} justifyContent="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Brand dark compact={false} href="/" />
              <Typography variant="body2" sx={{ color: 'grey.400', lineHeight: 1.8, pr: { md: 4 }, mt: 3, fontWeight: 400 }}>
                Your trusted partner for safe and comfortable bus travel across India. Book with confidence, travel with ease, and experience the next generation of transportation.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Quick Links</Typography>
              <Stack spacing={2}>
                {['About Us', 'Book a Trip', 'My Bookings', 'Contact Us'].map(l => (
                  <Typography key={l} variant="body2" sx={{ color: 'grey.400', cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: 'white' } }}>{l}</Typography>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Support</Typography>
              <Stack spacing={2}>
                {['FAQ', 'Terms of Service', 'Privacy Policy', 'Refund Policy'].map(l => (
                  <Typography key={l} variant="body2" sx={{ color: 'grey.400', cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: 'white' } }}>{l}</Typography>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Contact & Location</Typography>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)' }}><Phone size={18} /></Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>1800 123 4567</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)' }}><Mail size={18} /></Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>support@voyatra.com</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                   <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)' }}><MapPin size={18} /></Box>
                   <Typography variant="body2" sx={{ color: 'grey.400' }}>New Delhi, India</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 8, mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center' }}>© {new Date().getFullYear()} Voyatra. All rights reserved.</Typography>
        </Container>
      </Box>
    </Box>
  )
}
