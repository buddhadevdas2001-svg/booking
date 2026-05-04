'use client'

import { useState, useEffect } from 'react'
import {
  Bus,
  Users,
  Ticket,
  Calendar,
  MapPin,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Database,
  TrendingUp,
  Shield,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Chip,
  alpha,
  useTheme,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  NoSsr,
  Skeleton,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { AdminAnalytics, AdminSummary } from '@/types/supabase'

const DASHBOARD_CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec489a', '#f97316']

export default function AdminDashboardPage() {
  const theme = useTheme()
  const [timeframe, setTimeframe] = useState('week')
  const [seeding, setSeeding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: summary, isLoading, error: summaryError } = useQuery<AdminSummary>({
    queryKey: ['admin-summary'],
    queryFn: async () => {
      const res = await fetch('/api/admin/summary')
      if (res.status === 403) throw new Error('403')
      if (!res.ok) throw new Error('Failed to load dashboard')
      return res.json()
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === '403') return false
      return failureCount < 3
    }
  })

  const isUnauthorized = summaryError instanceof Error && summaryError.message === '403'

  const handleElevate = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/elevate-me', { method: 'POST' })
      if (!res.ok) throw new Error('Elevation failed')
      toast.success('Permissions granted! Reloading...')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to elevate permissions')
    } finally {
      setSeeding(false)
    }
  }

  const { data: analytics } = useQuery<AdminAnalytics>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed to load analytics')
      return res.json()
    },
  })

  const stats = [
    { title: 'Total Bookings', value: summary?.stats?.totalBookings ?? 0, icon: Ticket, trend: `${summary?.stats?.confirmationRate ?? 0}%`, trendUp: true, color: 'primary' },
    { title: 'Total Revenue', value: `₹${(summary?.stats?.totalRevenue ?? 0).toLocaleString()}`, icon: IndianRupee, trend: '', trendUp: true, color: 'success' },
    { title: 'Active Buses', value: summary?.stats?.activeBuses ?? 0, icon: Bus, trend: '', trendUp: false, color: 'warning' },
    { title: 'Registered Users', value: summary?.stats?.totalUsers ?? 0, icon: Users, trend: '', trendUp: true, color: 'secondary' },
  ]

  const handleSeedDatabase = async () => {
    if (!confirm('This will add sample data to your database. Continue?')) return
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/debug-seed', { method: 'POST' })
      if (!res.ok) throw new Error('Seeding failed')
      toast.success('Database seeded successfully!')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to seed database')
      console.error(error)
    } finally {
      setSeeding(false)
    }
  }

  const recentBookings = summary?.recentBookings ?? []
  const revenueData = analytics?.revenueSeries ?? []
  const bookingData = (analytics?.busTypes ?? []).map((item, index) => ({
    ...item,
    color: item.color || DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
  }))
  const upcomingTrips = summary?.upcomingTrips ?? []

  if (isUnauthorized) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 8, border: '1px solid', borderColor: 'divider', maxWidth: 500, mx: 'auto' }}>
          <Shield size={48} className="text-error" style={{ marginBottom: 24 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Access Denied</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your account does not have administrative privileges in production.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleElevate}
            disabled={seeding}
            sx={{ borderRadius: 3, px: 6, fontWeight: 900 }}
          >
            {seeding ? 'Processing...' : 'Elevate to Admin'}
          </Button>
          <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'text.disabled' }}>
            This is a debug tool for production testing.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Stack spacing={4}>
      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 8,
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), filter: 'blur(50px)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha(theme.palette.secondary.main, 0.1), filter: 'blur(50px)' }} />
        
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }} component="div">
            <Stack spacing={2} sx={{ position: 'relative' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                Welcome back, Admin!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Here&apos;s what&apos;s happening with your transport network today.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <Chip
                  icon={<Calendar size={14} />}
                  label={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  variant="outlined"
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                />
                <Button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  startIcon={<Database size={16} />}
                  variant="contained"
                  sx={{ borderRadius: 3, fontWeight: 800, px: 3 }}
                >
                  {seeding ? 'Seeding...' : 'Seed Database'}
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Grid */}
        <Grid container spacing={3}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i} component="div">
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 6,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4], borderColor: 'primary.main' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette[stat.color as 'primary' | 'success' | 'warning' | 'secondary'].main, 0.1), color: `${stat.color}.main` }}>
                  <stat.icon size={24} />
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: stat.trendUp ? 'success.main' : 'text.secondary' }}>
                  {stat.trendUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{stat.trend}</Typography>
                </Stack>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">vs last month</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4}>
      <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Revenue Overview</Typography>
              <ToggleButtonGroup value={timeframe} exclusive onChange={(_, v) => v && setTimeframe(v)} size="small">
                <ToggleButton value="day" sx={{ px: 2, fontWeight: 700 }}>Day</ToggleButton>
                <ToggleButton value="week" sx={{ px: 2, fontWeight: 700 }}>Week</ToggleButton>
                <ToggleButton value="month" sx={{ px: 2, fontWeight: 700 }}>Month</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Box sx={{ height: 320, width: '100%', minWidth: 0, position: 'relative', mt: 2 }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: 16, 
                        border: 'none', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        padding: '12px 16px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Booking Share</Typography>
            <Box sx={{ height: 260, width: '100%', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
              {isMounted ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={bookingData} 
                      innerRadius={65} 
                      outerRadius={85} 
                      paddingAngle={8} 
                      dataKey="value"
                      stroke="none"
                    >
                      {bookingData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton variant="rounded" height={250} sx={{ borderRadius: 4 }} />
              )}
            </Box>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {bookingData.map((item, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.value}%</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Activity Grid */}
      <Grid container spacing={4}>
      <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Bookings</Typography>
              <Button size="small" endIcon={<Eye size={16} />} sx={{ fontWeight: 700 }}>View All</Button>
            </Stack>
            <Stack spacing={2}>
              {recentBookings.map((booking, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: '0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: 'primary.main' }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>
                      {(booking.booking_reference || 'BK').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{booking.booking_reference}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={12} /> {booking.trip?.route?.origin} → {booking.trip?.route?.destination}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>₹{Number(booking.final_amount || 0).toLocaleString()}</Typography>
                    <Chip
                      label={booking.status}
                      size="small"
                      color={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'error'}
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Live Schedule</Typography>
              <IconButton size="small"><TrendingUp size={18} /></IconButton>
            </Stack>
            <Stack spacing={3}>
              {upcomingTrips.map((trip, i) => {
                const total = Number(trip.bus?.total_seats || trip.total_seats || 0)
                const available = Number(trip.available_seats ?? total)
                const filled = Math.max(total - available, 0)
                const progress = total ? (filled / total) * 100 : 0
                const dep = trip.departure_time ? new Date(trip.departure_time) : null
                const timeStr = dep ? dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'
                return (
                <Box key={i}>
                  <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900 }}>{timeStr}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {trip.route?.origin} → {trip.route?.destination}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{trip.bus?.name}</Typography>
                      </Box>
                    </Stack>
                    <Chip label={trip.status} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flexGrow: 1, position: 'relative' }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4, 
                          bgcolor: alpha(theme.palette.divider, 0.08),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                          }
                        }}
                      />
                    </Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={`${filled} / ${total || '—'}`}
                        size="small"
                        sx={{ 
                          height: 24, 
                          fontSize: "0.7rem", 
                          fontWeight: 900, 
                          borderRadius: 1.5,
                          bgcolor: progress > 80 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                          color: progress > 80 ? "error.main" : "primary.main",
                          border: 'none'
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: progress > 0 ? "primary.main" : "text.disabled", minWidth: 35, textAlign: 'right' }}>
                        {Math.round(progress)}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )})}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
