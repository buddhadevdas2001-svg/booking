'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, MapPin, Navigation, Clock, Trash2, Edit2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Route } from '@/types/supabase'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material'

export default function AdminRoutesPage() {
  const theme = useTheme()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/routes')
      if (!res.ok) throw new Error('Failed to load routes')
      const data = await res.json()
      return data as Route[]
    }
  })

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return

    try {
      const res = await fetch(`/api/admin/routes/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete route')
      toast.success('Route deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete route')
    }
  }

  const filteredRoutes = routes?.filter((r) => {
    const term = searchTerm.toLowerCase()
    return (
      r.origin.toLowerCase().includes(term) ||
      r.destination.toLowerCase().includes(term)
    )
  })

  return (
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Navigation size={24} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Route Management</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">Define and organize transport paths across your network.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => router.push('/admin/routes/new')}
          sx={{ borderRadius: 4, px: 3, fontWeight: 800, boxShadow: theme.shadows[4] }}
        >
          Create New Route
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          placeholder="Search routes by origin or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 500 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} style={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', py: 2.5 }}>Origin</TableCell>
                <TableCell align="center" />
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Destination</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Distance</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton variant="text" height={60} /></TableCell>
                  </TableRow>
                ))
              ) : filteredRoutes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Typography variant="body1" color="text.secondary">No routes found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoutes?.map((route) => (
                  <TableRow key={route.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }, transition: 'background-color 0.2s' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          <MapPin size={18} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{route.origin}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <ArrowRight size={16} style={{ color: theme.palette.text.secondary }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                          <MapPin size={18} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{route.destination}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Clock size={16} style={{ color: theme.palette.text.secondary }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {route.estimated_duration_minutes ? `${(route.estimated_duration_minutes / 60).toFixed(1)} Hrs` : 'N/A'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        {route.distance_km ? `${route.distance_km} km` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          sx={{ color: 'primary.main' }}
                          onClick={() => router.push(`/admin/routes/${route.id}/edit`)}
                        >
                          <Edit2 size={18} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'error.main' }}
                          onClick={() => handleDelete(route.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}
