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

export default function AdminBookingsPage() {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id(email),
          trip:trip_id(
            departure_time,
            route:route_id(origin, destination),
            bus:bus_id(name)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as any[]
    }
  })

  const filteredBookings = bookings?.filter((b) => {
    const term = searchTerm.toLowerCase()
    return (
      b.id.toLowerCase().includes(term) ||
      b.user?.email.toLowerCase().includes(term) ||
      b.trip?.route?.origin.toLowerCase().includes(term) ||
      b.trip?.route?.destination.toLowerCase().includes(term)
    )
  })

  const getStatusColor = (status: string) => {
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
          placeholder="Search bookings..."
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

      <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Trip</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5}><Skeleton height={60} /></TableCell></TableRow>)
              ) : filteredBookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32 }}>{booking.user?.email?.[0].toUpperCase()}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{booking.user?.email}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.trip?.route?.origin} → {booking.trip?.route?.destination}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(booking.trip?.departure_time).toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>₹{Number(booking.total_amount).toLocaleString()}</Typography></TableCell>
                  <TableCell><Chip label={booking.status} size="small" color={getStatusColor(booking.status) as any} /></TableCell>
                  <TableCell align="right"><IconButton size="small"><Eye size={18} /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}
