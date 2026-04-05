'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem, InputAdornment,
  Grid, Switch, FormControlLabel, alpha, useTheme, Divider, Chip,
} from '@mui/material'
import { ArrowLeft, Save, UserPlus, Shield, Phone, Briefcase, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  { value: 'driver', label: '🚌 Driver', desc: 'Operates the bus' },
  { value: 'conductor', label: '🎫 Conductor', desc: 'Manages tickets & passengers' },
  { value: 'agent', label: '🧑‍💼 Agent', desc: 'Booking and customer support' },
  { value: 'admin', label: '🔐 Admin', desc: 'Full platform access' },
]

export default function NewStaffPage() {
  const router = useRouter()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    staff_type: 'driver',
    employee_id: '',
    license_number: '',
    experience_years: '',
    joining_date: '',
    salary: '',
    is_active: true,
    // For new user creation: these are informational only stored via profile
    full_name: '',
    phone: '',
  })

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      toast.error('Full name is required')
      return
    }
    setLoading(true)
    try {
      // 1. Prepare payload - user_id is now handled on the backend or left NULL 
      // for staff added manually by admin.
      const staffPayload: Record<string, unknown> = {
        staff_type: form.staff_type,
        employee_id: form.employee_id || null,
        license_number: form.license_number || null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        joining_date: form.joining_date || null,
        salary: form.salary ? Number(form.salary) : null,
        is_active: form.is_active,
        full_name: form.full_name,
        phone: form.phone || null,
      }

      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffPayload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Server error ${res.status}`)
      }

      toast.success(`${form.full_name} added as ${form.staff_type}!`)
      router.push('/admin/staff')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create staff member')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find((r) => r.value === form.staff_type)

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button
          href="/admin/staff"
          component="a"
          startIcon={<ArrowLeft size={18} />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Add Staff Member</Typography>
          <Typography variant="body2" color="text.secondary">Create a new driver, conductor, agent or admin profile</Typography>
        </Box>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Role Selection */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Staff Role</Typography>
              <Grid container spacing={2}>
                {ROLES.map((role) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={role.value}>
                    <Paper
                      onClick={() => update('staff_type', role.value)}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        border: '2px solid',
                        borderColor: form.staff_type === role.value ? 'primary.main' : 'divider',
                        bgcolor: form.staff_type === role.value ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.light', bgcolor: alpha(theme.palette.primary.main, 0.02) },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.5 }}>{role.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{role.desc}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {selectedRole && (
                <Box sx={{ mt: 2 }}>
                  <Chip label={`Selected: ${selectedRole.label}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Personal Info */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <UserPlus size={20} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Personal Information</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    required
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={16} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Professional Info */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <Briefcase size={20} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Professional Details</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Employee ID"
                    fullWidth
                    value={form.employee_id}
                    onChange={(e) => update('employee_id', e.target.value)}
                    placeholder="EMP-001"
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <Hash size={16} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="License Number"
                    fullWidth
                    value={form.license_number}
                    onChange={(e) => update('license_number', e.target.value)}
                    placeholder="DL-0420110012345"
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <Shield size={16} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Experience (years)"
                    fullWidth
                    type="number"
                    value={form.experience_years}
                    onChange={(e) => update('experience_years', e.target.value)}
                    inputProps={{ min: 0, max: 50 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Joining Date"
                    fullWidth
                    type="date"
                    value={form.joining_date}
                    onChange={(e) => update('joining_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Monthly Salary (₹)"
                    fullWidth
                    type="number"
                    value={form.salary}
                    onChange={(e) => update('salary', e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => update('is_active', e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Active Status</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active staff members can be assigned to trips
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button href="/admin/staff" component="a" variant="outlined" sx={{ borderRadius: 3, fontWeight: 700, px: 4 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save size={18} />}
                sx={{ borderRadius: 3, fontWeight: 800, px: 5 }}
              >
                {loading ? 'Saving…' : 'Add Staff Member'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
