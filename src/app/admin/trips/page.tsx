'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, MapPin, Users, Bus, Zap } from 'lucide-react'
import { calculateDynamicPrice } from '@/lib/pricing_engine'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Avatar,
  Tooltip as MuiTooltip,
} from '@mui/material'

export default function AdminTripsPage() {
  const theme = useTheme()
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: async () => {
      const res = await fetch('/api/admin/trips')
      if (!res.ok) throw new Error('Failed to load trips')
      return res.json()
    },
  })

  return (
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
            Trips
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage scheduled departures and bus assignments
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/trips/new"
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 800 }}
        >
          New Trip
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5 }}>Route Details</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Bus Assignment</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Departure</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Arrival</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Dynamic Price</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" color="text.secondary">Loading trips...</Typography>
                </TableCell>
              </TableRow>
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" color="text.secondary">No trips scheduled yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip: any) => {
                const dep = trip.departure_time ? new Date(trip.departure_time) : null
                const arr = trip.arrival_time ? new Date(trip.arrival_time) : null
                const pricing = dep ? calculateDynamicPrice({
                  base_price: Number(trip.base_price) || 0,
                  departure_time: dep,
                  available_seats: Number(trip.available_seats) || 0,
                  total_seats: Number(trip.total_seats) || 0,
                }) : null

                return (
                  <TableRow key={trip.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ py: 3 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                            <MapPin size={14} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {trip.route?.origin} → {trip.route?.destination}
                          </Typography>
                        </Stack>
                        <Button
                          component={Link}
                          href={`/admin/trips/${trip.id}/assign-staff`}
                          size="small"
                          startIcon={<Users size={14} />}
                          sx={{ fontSize: '0.7rem', fontWeight: 700, width: 'fit-content', opacity: 0.8, '&:hover': { opacity: 1 } }}
                        >
                          Assign Crew
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                          <Bus size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{trip.bus?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{trip.bus?.bus_type}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {dep ? dep.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dep ? dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {arr ? arr.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {arr ? arr.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          {pricing ? `₹${pricing.effective_price.toLocaleString()}` : `₹${Number(trip.base_price || 0).toLocaleString()}`}
                        </Typography>
                        {pricing && pricing.discount_percentage !== 0 && (
                          <MuiTooltip title={pricing.adjustment_reason}>
                            <Chip
                              icon={<Zap size={10} />}
                              label={`${pricing.discount_percentage > 0 ? '+' : ''}${pricing.discount_percentage}%`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: pricing.discount_percentage > 0 ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                color: pricing.discount_percentage > 0 ? 'warning.main' : 'success.main',
                                border: 'none'
                              }}
                            />
                          </MuiTooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trip.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderColor: 'divider'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
