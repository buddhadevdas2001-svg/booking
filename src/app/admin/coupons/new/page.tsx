'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem,
  Grid, Switch, FormControlLabel, alpha, useTheme, Divider, Chip,
  InputAdornment,
} from '@mui/material'
import { ArrowLeft, Save, Tag, Percent, Banknote, Calendar, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewCouponPage() {
  const router = useRouter()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: '',
    is_active: true,
  })

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) {
      toast.error('Coupon code is required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_purchase_amount: form.min_purchase_amount ? Number(form.min_purchase_amount) : null,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Server error ${res.status}`)
      }

      toast.success(`Coupon ${form.code} created successfully!`)
      router.push('/admin/coupons')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button
          href="/admin/coupons"
          component="a"
          startIcon={<ArrowLeft size={18} />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Create New Coupon</Typography>
          <Typography variant="body2" color="text.secondary">Set up a new discount code for your customers</Typography>
        </Box>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Coupon Details</Typography>
                  <Typography variant="caption" color="text.secondary">Basic information about the discount</Typography>
                </Box>

                <TextField
                  label="Coupon Code"
                  fullWidth
                  required
                  placeholder="SAVE50"
                  value={form.code}
                  onChange={(e) => update('code', e.target.value.toUpperCase())}
                  InputProps={{ startAdornment: <Tag size={16} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 700, fontFamily: 'monospace' } }}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Get 50% off on your first booking"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      select
                      label="Type"
                      fullWidth
                      value={form.discount_type}
                      onChange={(e) => update('discount_type', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    >
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Value"
                      fullWidth
                      required
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => update('discount_value', e.target.value)}
                      InputProps={{ 
                        endAdornment: <Typography variant="body2" sx={{ ml: 1, fontWeight: 700 }}>{form.discount_type === 'percentage' ? '%' : '₹'}</Typography>
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Limits & Validity</Typography>
                
                <Stack spacing={3}>
                  <TextField
                    label="Valid From"
                    fullWidth
                    type="date"
                    value={form.valid_from}
                    onChange={(e) => update('valid_from', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    label="Valid Until"
                    fullWidth
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => update('valid_until', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    label="Usage Limit"
                    fullWidth
                    type="number"
                    placeholder="Enter max uses"
                    value={form.usage_limit}
                    onChange={(e) => update('usage_limit', e.target.value)}
                    helperText="Total number of times this coupon can be used across all users"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Conditions</Typography>
                
                <Stack spacing={3}>
                  <TextField
                    label="Min Purchase (₹)"
                    fullWidth
                    type="number"
                    value={form.min_purchase_amount}
                    onChange={(e) => update('min_purchase_amount', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  {form.discount_type === 'percentage' && (
                    <TextField
                      label="Max Discount (₹)"
                      fullWidth
                      type="number"
                      value={form.max_discount_amount}
                      onChange={(e) => update('max_discount_amount', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                  )}
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.is_active}
                        onChange={(e) => update('is_active', e.target.checked)}
                        color="success"
                      />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Coupon</Typography>}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 8 }}>
              <Button href="/admin/coupons" component="a" variant="outlined" sx={{ borderRadius: 3, fontWeight: 700, px: 4 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save size={18} />}
                sx={{ borderRadius: 3, fontWeight: 800, px: 6 }}
              >
                {loading ? 'Creating…' : 'Create Coupon'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
