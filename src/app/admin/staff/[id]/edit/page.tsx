'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Typography, Paper, Stack, Button, TextField,
  Grid, Switch, FormControlLabel, alpha, useTheme, Divider, Chip,
  Skeleton,
} from '@mui/material'
import { ArrowLeft, Save, UserPlus, Shield, Phone, Briefcase, Hash } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'driver', label: '🚌 Driver', desc: 'Operates the bus' },
  { value: 'conductor', label: '🎫 Conductor', desc: 'Manages tickets & passengers' },
  { value: 'agent', label: '🧑‍💼 Agent', desc: 'Booking and customer support' },
  { value: 'admin', label: '🔐 Admin', desc: 'Full platform access' },
]

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    staff_type: 'driver',
    employee_id: '',
    license_number: '',
    experience_years: '',
    joining_date: '',
    salary: '',
    is_active: true,
    full_name: '',
    phone: '',
  })

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(`/api/admin/staff/${id}`)
        if (!res.ok) throw new Error('Staff member not found')
        const data = await res.json()
        
        setForm({
          staff_type: data.staff_type || 'driver',
          employee_id: data.employee_id || '',
          license_number: data.license_number || '',
          experience_years: data.experience_years?.toString() || '',
          joining_date: data.joining_date || '',
          salary: data.salary?.toString() || '',
          is_active: data.is_active ?? true,
          full_name: data.user?.full_name || '',
          phone: data.user?.phone || '',
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load staff')
        router.push('/admin/staff')
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [id, router])

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      toast.error('Full name is required')
      return
    }
    setSaving(true)
    try {
      const staffPayload = {
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

      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffPayload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Server error ${res.status}`)
      }

      toast.success('Staff member updated successfully!')
      router.push('/admin/staff')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update staff member')
    } finally {
      setSaving(false)
    }
  }

  const selectedRole = ROLES.find((r) => r.value === form.staff_type)

  if (loading) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
        <Skeleton variant="rectangular" height={40} width={100} sx={{ mb: 4, borderRadius: 2 }} />
        <Skeleton variant="text" height={60} width="40%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={30} width="60%" sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 6 }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 6 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

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
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Edit Staff Member</Typography>
          <Typography variant="body2" color="text.secondary">Update profile and professional details for {form.full_name}</Typography>
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
                    InputProps={{ startAdornment: <Phone size={16} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
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
                    InputProps={{ startAdornment: <Hash size={16} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
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
                    InputProps={{ startAdornment: <Shield size={16} style={{ marginRight: 8, color: theme.palette.text.secondary }} /> }}
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
                disabled={saving}
                startIcon={<Save size={18} />}
                sx={{ borderRadius: 3, fontWeight: 800, px: 5 }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
