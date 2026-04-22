'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Eye, Download, Ticket, Calendar, Clock, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material'
import type { ChipProps } from '@mui/material'
import type { Booking } from '@/types/supabase'

type AdminBookingRow = Booking & {
  user?: {
    email?: string | null
  } | null
  trip?: {
    departure_time?: string | null
    route?: {
      origin?: string | null
      destination?: string | null
    } | null
    bus?: {
      name?: string | null
    } | null
  } | null
}

export default function AdminBookingsPage() {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: bookings, isLoading, error: queryError } = useQuery<AdminBookingRow[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id(full_name),
          trip:trip_id(
            departure_time,
            route:route_id(origin, destination),
            bus:bus_id(name)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return (data || []) as AdminBookingRow[]
    }
  })

  const filteredBookings = bookings?.filter((b) => {
    const term = searchTerm.toLowerCase()
    const email = b.contact_email?.toLowerCase() || ''
    const ref = b.booking_reference?.toLowerCase() || ''
    const origin = b.trip?.route?.origin?.toLowerCase() || ''
    const destination = b.trip?.route?.destination?.toLowerCase() || ''
    return (
      b.id.toLowerCase().includes(term) ||
      ref.includes(term) ||
      email.includes(term) ||
      origin.includes(term) ||
      destination.includes(term)
    )
  })

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  return (
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Ticket size={24} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Booking Management</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">View and manage all customer tickets and transaction history.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Download size={18} />} sx={{ borderRadius: 4, px: 3, fontWeight: 800 }}>Export</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          placeholder="Search by reference, email, or route..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 500 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>,
            sx: { borderRadius: 3 }
          }}
        />
      </Paper>

      {queryError && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px solid', borderColor: 'error.main' }}>
          <Typography color="error" sx={{ fontWeight: 700 }}>Failed to load bookings: {(queryError as Error).message}</Typography>
        </Paper>
      )}

      <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Reference & Contact</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Trip</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => <TableRow key={i}><TableCell colSpan={5}><Skeleton height={70} /></TableCell></TableRow>)
              ) : filteredBookings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>No bookings found.</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredBookings?.map((booking) => (
                <TableRow key={booking.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '0.9rem', fontWeight: 800 }}>
                        {booking.booking_reference.slice(-2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{booking.booking_reference}</Typography>
                          {booking.user?.full_name && <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.05), px: 0.8, py: 0.2, borderRadius: 1 }}>{booking.user.full_name}</Typography>}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{booking.contact_email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.trip?.route?.origin} → {booking.trip?.route?.destination}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Clock size={12} className="text-slate-400" />
                      <Typography variant="caption" color="text.secondary">
                        {booking.trip?.departure_time ? new Date(booking.trip.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Departure pending'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>₹{Number(booking.final_amount || booking.total_amount).toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{booking.payment_status}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status} 
                      size="small" 
                      color={getStatusColor(booking.status)}
                      sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', height: 20 }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" sx={{ color: 'primary.main' }}><Eye size={18} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}
