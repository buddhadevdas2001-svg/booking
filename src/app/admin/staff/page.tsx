'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Stack, Button, TextField, InputAdornment,
  Grid, Avatar, Chip, IconButton, Tooltip, alpha, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Skeleton, Badge, Divider,
} from '@mui/material'
import {
  Plus, Search, Edit2, Trash2, Shield, Phone,
  Briefcase, Users, Star, RefreshCw, Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Staff } from '@/types/supabase'

type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'

type StaffWithProfile = Staff & {
  user?: {
    id: string
    full_name: string
    phone?: string | null
    avatar_url?: string | null
  } | null
}

const ROLE_CONFIG: Record<string, { label: string; color: ChipColor }> = {
  driver: { label: 'Driver', color: 'primary' },
  conductor: { label: 'Conductor', color: 'success' },
  admin: { label: 'Admin', color: 'warning' },
  agent: { label: 'Agent', color: 'secondary' },
}

export default function AdminStaffPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')

  const { data: staff = [], isLoading, isFetching, refetch } = useQuery<StaffWithProfile[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await fetch('/api/admin/staff')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load staff')
      }
      return (await res.json()) as StaffWithProfile[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to delete staff')
      }
    },
    onSuccess: () => {
      toast.success('Staff member removed successfully')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  })

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return staff.filter((m) => {
      const name = m.user?.full_name?.toLowerCase() || ''
      const phone = m.user?.phone?.toLowerCase() || ''
      const role = m.staff_type?.toLowerCase() || ''
      const empId = m.employee_id?.toLowerCase() || ''
      const matchSearch = !term || name.includes(term) || phone.includes(term) || role.includes(term) || empId.includes(term)
      const matchRole = filterRole === 'all' || m.staff_type === filterRole
      return matchSearch && matchRole
    })
  }, [staff, searchTerm, filterRole])

  const stats = useMemo(() => ({
    total: staff.length,
    drivers: staff.filter(s => s.staff_type === 'driver').length,
    conductors: staff.filter(s => s.staff_type === 'conductor').length,
    active: staff.filter(s => s.is_active !== false).length,
  }), [staff])

  return (
    <Stack spacing={4}>
      {/* Summary Cards */}
      <Grid container spacing={3}>
        {[
          { label: 'Total Staff', value: stats.total, icon: Users, color: 'primary' as const },
          { label: 'Drivers', value: stats.drivers, icon: Shield, color: 'info' as const },
          { label: 'Conductors', value: stats.conductors, icon: Award, color: 'success' as const },
          { label: 'Active Staff', value: stats.active, icon: Star, color: 'warning' as const },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 6,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6], borderColor: `${stat.color}.main` },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette[stat.color]?.main || theme.palette.primary.main, 0.1), color: `${stat.color}.main` }}>
                  <stat.icon size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{stat.label}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{stat.value}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Controls */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexGrow: 1 }}>
            <TextField
              placeholder="Search by name, phone, ID, role…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ maxWidth: 360 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>,
                sx: { borderRadius: 3 },
              }}
            />
            <TextField
              select
              size="small"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ minWidth: 160 }}
              InputProps={{ sx: { borderRadius: 3 } }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="driver">Drivers</MenuItem>
              <MenuItem value="conductor">Conductors</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
              <MenuItem value="agent">Agents</MenuItem>
            </TextField>
          </Stack>
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
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              href="/admin/staff/new"
              component="a"
              sx={{ borderRadius: 3, fontWeight: 800 }}
            >
              Add Staff
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Staff Grid */}
      <Grid container spacing={3}>
        {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Skeleton variant="rounded" height={220} sx={{ borderRadius: 6 }} />
              </Grid>
            ))
          : filtered.length === 0
          ? (
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '2px dashed', borderColor: 'divider' }}>
                <Users size={48} style={{ color: theme.palette.text.disabled, marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {searchTerm || filterRole !== 'all' ? 'No staff match your search' : 'No staff members yet'}
                </Typography>
                <Button variant="contained" href="/admin/staff/new" component="a" startIcon={<Plus size={16} />} sx={{ borderRadius: 3 }}>
                  Add First Staff Member
                </Button>
              </Paper>
            </Grid>
          )
                : filtered.map((member) => {
              const roleConf = ROLE_CONFIG[member.staff_type || ''] ?? { label: member.staff_type, color: 'default' as ChipColor }
              const initials = (member.user?.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

                return (
                <Grid key={member.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': { boxShadow: theme.shadows[8], borderColor: 'primary.light', transform: 'translateY(-2px)' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box sx={{
                              width: 12, height: 12, borderRadius: '50%',
                              bgcolor: member.is_active !== false ? 'success.main' : 'error.main',
                              border: '2px solid white',
                            }} />
                          }
                        >
                          <Avatar
                            src={member.user?.avatar_url || undefined}
                            sx={{
                              width: 52, height: 52, fontWeight: 900, fontSize: '1.1rem',
                              bgcolor: alpha(theme.palette.primary.main, 0.15),
                              color: 'primary.main',
                            }}
                          >
                            {initials}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {member.user?.full_name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {member.employee_id || 'No Employee ID'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            href={`/admin/staff/${member.id}/edit`}
                            component="a"
                            sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' } }}
                          >
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteId(member.id)}
                            sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main' } }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5}>
                      {member.user?.phone && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Phone size={14} style={{ color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">{member.user.phone}</Typography>
                        </Stack>
                      )}
                      {member.license_number && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Shield size={14} style={{ color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">License: {member.license_number}</Typography>
                        </Stack>
                      )}
                      {member.experience_years != null && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Briefcase size={14} style={{ color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">{member.experience_years} years experience</Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                      <Chip
                        label={roleConf.label}
                        color={roleConf.color}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={member.is_active !== false ? 'Active' : 'Inactive'}
                        color={member.is_active !== false ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              )
            })
        }
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 6 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Remove Staff Member?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently remove this staff member from the system. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ borderRadius: 3, fontWeight: 700 }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            sx={{ borderRadius: 3, fontWeight: 800 }}
          >
            {deleteMutation.isPending ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
