'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Divider,
  Grid,
} from '@mui/material'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import Brand from '@/components/common/Brand'

const loginFeatures = [
  {
    icon: Shield,
    title: 'Secure Access',
    desc: 'Protected account and traveler data',
    color: '#3969c5',
  },
  {
    icon: Sparkles,
    title: 'Smart Travel',
    desc: 'A faster and cleaner booking experience',
    color: '#f5b433',
  },
  {
    icon: Clock3,
    title: 'Quick Checkout',
    desc: 'Open bookings and manage tickets instantly',
    color: '#35a947',
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const theme = useTheme()
  const { setUser } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      const profile = data.profile
      if (profile) {
        setUser({ ...profile, email: data.user.email })
      }

      toast.success('Welcome back!')
      const redirect =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null
      const role = profile?.role
      if (redirect) router.push(redirect)
      else if (role === 'admin' || role === 'agent') router.push('/admin')
      else router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
}

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decor */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Grid container spacing={8} alignItems="center">
          {/* Left Side: Info */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Stack spacing={4}>
              <Brand href="/" />
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: '0.3em',
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 2,
                    display: 'block',
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="h1" sx={{ fontSize: '3.5rem', lineHeight: 1.1, mb: 3 }}>
                  Sign in and <br />
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Continue your journey.
                  </Box>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Access bookings, manage tickets, and continue your travel experience with Voyatra.
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ maxWidth: 400 }}>
                {loginFeatures.map((feature) => (
                  <Paper
                    key={feature.title}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: feature.color,
                        bgcolor: alpha(feature.color, 0.02),
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                        }}
                      >
                        <feature.icon size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Right Side: Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 8,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: { md: 'none' } }}>
                  <Brand compact />
                </Box>
                <Button
                  component={Link}
                  href="/"
                  variant="text"
                  startIcon={<ArrowLeft size={18} />}
                  sx={{ borderRadius: 3, color: 'text.secondary' }}
                >
                  Back Home
                </Button>
              </Box>

              <Box sx={{ mb: 5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your Voyatra account and pick up where you left off.
                </Typography>
              </Box>

              <Stack component="form" onSubmit={handleLogin} spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={18} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 4 },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 4 },
                      },
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    borderRadius: 4,
                    boxShadow: theme.shadows[10],
                  }}
                  endIcon={!loading && <ArrowRight size={20} />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Don't have an account?{' '}
                  <Link href="/auth/register" style={{ color: theme.palette.primary.main, fontWeight: 700, textDecoration: 'none' }}>
                    Create one
                  </Link>
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
