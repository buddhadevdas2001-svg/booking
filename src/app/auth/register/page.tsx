'use client'

import { useEffect, useState } from 'react'
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
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Grid,
} from '@mui/material'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import Brand from '@/components/common/Brand'

const featureCards = [
  {
    icon: Shield,
    title: 'Secure Booking',
    desc: 'Protected payments and account safety',
    color: '#3969c5',
  },
  {
    icon: CreditCard,
    title: 'Best Prices',
    desc: 'Competitive fares on every major route',
    color: '#f5b433',
  },
  {
    icon: Clock3,
    title: '24/7 Support',
    desc: 'Travel help whenever you need it',
    color: '#35a947',
  },
  {
    icon: Calendar,
    title: 'Easy Changes',
    desc: 'Flexible booking and trip management',
    color: '#3a69c6',
  },
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  const router = useRouter()
  const theme = useTheme()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const password = form.password
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [form.password])

  useEffect(() => {
    if (form.confirm) setPasswordsMatch(form.password === form.confirm)
    else setPasswordsMatch(true)
  }, [form.password, form.confirm])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!form.email.trim()) {
      toast.error('Please enter your email address')
      return
    }
    if (!form.password) {
      toast.error('Please enter a password')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms to continue')
      return
    }

    setLoading(true)
    try {
      // 1. Call our secure server API to create user & profile
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      // 2. Log them in client-side immediately after signup
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (loginError) throw loginError

      const profile = await getCurrentProfile().catch(() => null)
      if (profile) {
        setUser(profile)
      }

      toast.success('Account created successfully! Welcome aboard!')
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
}

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'grey.300'
    if (passwordStrength === 1) return 'error.main'
    if (passwordStrength === 2) return 'warning.main'
    if (passwordStrength === 3) return 'warning.light'
    return 'success.main'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'No password'
    if (passwordStrength === 1) return 'Weak'
    if (passwordStrength === 2) return 'Fair'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
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
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.08)} 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.08)} 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
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
                  Your next trip is waiting
                </Typography>
                <Typography variant="h1" sx={{ fontSize: '3.2rem', lineHeight: 1.1, mb: 3 }}>
                  Create your account and <br />
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Start booking smarter.
                  </Box>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 500 }}>
                  Join Voyatra to save routes, manage tickets, and book with a faster, cleaner travel experience.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {featureCards.map((feature) => (
                  <Grid key={feature.title} size={{ xs: 6 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: feature.color,
                          bgcolor: alpha(feature.color, 0.02),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                          display: 'inline-flex',
                          mb: 2,
                        }}
                      >
                        <feature.icon size={18} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                        {feature.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          {/* Right Side: Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 8,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                  Create account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join Voyatra and book your first trip with a cleaner, faster experience.
                </Typography>
              </Box>

              <Stack component="form" onSubmit={handleRegister} spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Full Name
                  </Typography>
                  <TextField
                    fullWidth
                    name="full_name"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={18} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 4 },
                      },
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                      Phone (optional)
                    </Typography>
                    <TextField
                      fullWidth
                      name="phone"
                      placeholder="+91 00000 00000"
                      value={form.phone}
                      onChange={handleChange}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone size={18} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 4 },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                      Password
                    </Typography>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={form.password}
                      onChange={handleChange}
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                      Confirm Password
                    </Typography>
                    <TextField
                      fullWidth
                      name="confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={form.confirm}
                      onChange={handleChange}
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
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 4 },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {form.password && (
                  <Box sx={{ mt: -1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password Strength: <strong>{getPasswordStrengthText()}</strong>
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength / 4) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getPasswordStrengthColor(),
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                      <Requirement ok={form.password.length >= 6} text="6+ chars" />
                      <Requirement ok={/[A-Z]/.test(form.password) && /[a-z]/.test(form.password)} text="Aa" />
                      <Requirement ok={/[0-9]/.test(form.password)} text="0-9" />
                    </Stack>
                  </Box>
                )}

                {!passwordsMatch && form.confirm && (
                  <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <XCircle size={14} /> Passwords do not match
                  </Typography>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to the <Link href="#" style={{ color: theme.palette.primary.main, fontWeight: 600 }}>Terms & Conditions</Link>
                    </Typography>
                  }
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  disabled={loading || (form.confirm !== '' && !passwordsMatch)}
                  sx={{
                    py: 1.8,
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    borderRadius: 4,
                    boxShadow: theme.shadows[10],
                  }}
                  endIcon={!loading && <ArrowRight size={20} />}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <Link href="/auth/login" style={{ color: theme.palette.primary.main, fontWeight: 700, textDecoration: 'none' }}>
                    Sign in
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

function Requirement({ ok, text }: { ok: boolean; text: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {ok ? (
        <CheckCircle size={14} color="#35a947" />
      ) : (
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid', borderColor: 'grey.300' }} />
      )}
      <Typography variant="caption" color={ok ? 'success.main' : 'text.secondary'} sx={{ fontWeight: ok ? 600 : 400 }}>
        {text}
      </Typography>
    </Stack>
  )
}
