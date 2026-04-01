'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Stack, Button, Grid, Chip,
  alpha, useTheme, Divider, ToggleButtonGroup, ToggleButton, Skeleton, NoSsr,
} from '@mui/material'
import {
  BarChart3, TrendingUp, MapPin, IndianRupee, RefreshCw,
  ArrowUp, Bus, Users, Ticket,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from 'recharts'
import type { AdminAnalytics, AdminSummary, AnalyticsRoutePoint } from '@/types/supabase'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']

type ChartTooltipEntry = {
  dataKey?: string
  name?: string
  value?: number | string
  color?: string
}

type ChartTooltipProps = {
  active?: boolean
  payload?: ChartTooltipEntry[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <Paper elevation={8} sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1, color: 'text.secondary' }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.dataKey} variant="body2" sx={{ fontWeight: 800, color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.includes('Revenue') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </Typography>
      ))}
    </Paper>
  )
}

export default function AdminAnalyticsPage() {
  const theme = useTheme()
  const [timeframe, setTimeframe] = useState('month')

  const { data: analytics, isLoading, refetch, isFetching } = useQuery<AdminAnalytics>({
    queryKey: ['admin-analytics', timeframe],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed to load analytics')
      return res.json()
    },
  })

  const { data: summary } = useQuery<AdminSummary>({
    queryKey: ['admin-summary'],
    queryFn: async () => {
      const res = await fetch('/api/admin/summary')
      if (!res.ok) throw new Error('Failed to load summary')
      return res.json()
    },
  })

  const revenueData = (analytics?.revenueSeries || []).map((r) => ({
    ...r,
    name: new Date(r.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  }))

  const routeData = analytics?.popularRoutes || []

  const busTypeData = (analytics?.busTypes || []).map((item, i: number) => ({
    ...item,
    color: COLORS[i % COLORS.length],
  }))

  const totalRevenue = revenueData.reduce((s: number, r) => s + (r.revenue || 0), 0)
  const totalBookings = summary?.stats?.totalBookings ?? 0
  const totalUsers = summary?.stats?.totalUsers ?? 0
  const activeBuses = summary?.stats?.activeBuses ?? 0

  const statCards = [
    { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'success' as const, trend: '+12.5%' },
    { title: 'Total Bookings', value: totalBookings, icon: Ticket, color: 'primary' as const, trend: '+8.2%' },
    { title: 'Registered Users', value: totalUsers, icon: Users, color: 'secondary' as const, trend: '+5.1%' },
    { title: 'Active Buses', value: activeBuses, icon: Bus, color: 'warning' as const, trend: 'Fleet' },
  ]

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Analytics Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Track performance metrics and business insights</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            Refresh
          </Button>
          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={(_, v) => v && setTimeframe(v)}
            size="small"
          >
            {['week', 'month', 'year'].map((t) => (
              <ToggleButton key={t} value={t} sx={{ px: 2.5, fontWeight: 700, textTransform: 'capitalize' }}>
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Key Metric Cards */}
      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid key={stat.title} size={{ xs: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 6,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8], borderColor: `${stat.color}.main` },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette[stat.color].main, 0.1), color: `${stat.color}.main` }}>
                  <stat.icon size={22} />
                </Box>
                <Chip
                  label={stat.trend}
                  size="small"
                  icon={<ArrowUp size={12} />}
                  color="success"
                  sx={{ fontWeight: 700, fontSize: '0.65rem', height: 22 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'text.secondary' }}>
                {stat.title}
              </Typography>
              {isLoading
                ? <Skeleton width={100} height={40} />
                : <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{stat.value}</Typography>
              }
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Revenue & Bus Type Charts */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Revenue Trend</Typography>
                <Typography variant="caption" color="text.secondary">Daily revenue over the last 30 days</Typography>
              </Box>
              <BarChart3 size={20} style={{ color: theme.palette.text.secondary }} />
            </Stack>
            {isLoading
              ? <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 4 }} />
              : (
                <NoSsr fallback={<Skeleton variant="rectangular" height={280} sx={{ borderRadius: 4 }} />}>
                  <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={theme.palette.primary.main} strokeWidth={3} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 6, fill: theme.palette.primary.main }} />
                  </AreaChart>
                  </ResponsiveContainer>
                </NoSsr>
              )
            }
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Bus Type Mix</Typography>
            <Typography variant="caption" color="text.secondary">Fleet distribution by type</Typography>

            {isLoading
              ? <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 4 }} />
              : busTypeData.length === 0
              ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 250 }}>
                  <Typography variant="body2" color="text.secondary">No data yet</Typography>
                </Stack>
              )
              : (
                <>
                  <Box sx={{ height: 220, mt: 2, minWidth: 0, minHeight: 0 }}>
                    <NoSsr fallback={<Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={busTypeData} innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="value">
                            {busTypeData.map((entry, i: number) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </NoSsr>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    {busTypeData.map((item, i: number) => (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )
            }
          </Paper>
        </Grid>
      </Grid>

      {/* Route Performance */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
              <MapPin size={20} style={{ color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Top Performing Routes</Typography>
                <Typography variant="caption" color="text.secondary">Ranked by number of bookings</Typography>
              </Box>
            </Stack>
            {isLoading
              ? <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 4 }} />
              : routeData.length === 0
              ? <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No route data yet</Typography>
              : (
                <NoSsr fallback={<Skeleton variant="rectangular" height={260} sx={{ borderRadius: 4 }} />}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={routeData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                      <YAxis type="category" dataKey="name" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="bookings" name="Bookings" radius={[0, 6, 6, 0]}>
                        {routeData.map((_, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </NoSsr>
              )
            }
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }} sx={{ minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
              <TrendingUp size={20} style={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Route Revenue Table</Typography>
            </Stack>
            <Stack spacing={0} divider={<Divider />}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={52} />)
                : routeData.slice(0, 6).map((route: AnalyticsRoutePoint, i: number) => (
                    <Box key={i} sx={{ py: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{route.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{route.bookings} bookings</Typography>
                          </Box>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main' }}>
                          ₹{(route.revenue || 0).toLocaleString('en-IN')}
                        </Typography>
                      </Stack>
                    </Box>
                  ))
              }
              {!isLoading && routeData.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No confirmed bookings yet. Data will appear once users book trips.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
