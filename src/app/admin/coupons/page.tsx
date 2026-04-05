'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Stack, Button, TextField, InputAdornment,
  Grid, Card, CardContent, Chip, IconButton, Tooltip, alpha, useTheme,
  Divider, Skeleton,
} from '@mui/material'
import {
  Plus, Search, Tag, Calendar, Users, Percent, Trash2, Edit2,
  Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Coupon = {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number | null
  max_discount_amount: number | null
  valid_from: string
  valid_until: string
  usage_limit: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export default function AdminCouponsPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await fetch('/api/admin/coupons')
      if (!res.ok) throw new Error('Failed to fetch coupons')
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete coupon')
    },
    onSuccess: () => {
      toast.success('Coupon deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active }),
      })
      if (!res.ok) throw new Error('Failed to update status')
    },
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (date: string) => new Date(date) < new Date()

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Coupons & Offers</Typography>
          <Typography variant="body2" color="text.secondary">Create and manage discount codes for your customers</Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/coupons/new"
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 3, fontWeight: 800, px: 3 }}
        >
          New Coupon
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Search by coupon code or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} style={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent' } }}
        />
      </Paper>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 6 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredCoupons.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
          <Tag size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
          <Typography variant="h6" color="text.secondary">No coupons found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Create your first discount code to get started!</Typography>
          <Button component={Link} href="/admin/coupons/new" variant="outlined">Create Coupon</Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.valid_until)
            const active = coupon.is_active && !expired

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={coupon.id}>
                <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1, color: active ? 'primary.main' : 'text.disabled' }}>
                            {coupon.code}
                          </Typography>
                          {active ? (
                            <Chip label="Active" color="success" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                          ) : (
                            <Chip label={expired ? "Expired" : "Inactive"} color="error" size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {coupon.description || 'No description provided'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small" component={Link} href={`/admin/coupons/${coupon.id}/edit`}>
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => deleteMutation.mutate(coupon.id)} color="error">
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Discount</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800 }}>
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Usage</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800 }}>
                          {coupon.used_count} / {coupon.usage_limit || '∞'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                          <Clock size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Ends {new Date(coupon.valid_until).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        fullWidth
                        size="small"
                        variant={active ? "outlined" : "contained"}
                        color={active ? "warning" : "success"}
                        onClick={() => toggleStatusMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        {active ? "Deactivate" : "Activate"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}
