'use client'

import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  alpha,
  useTheme,
  TextField,
  Avatar,
  IconButton,
  Grid,
  Divider,
} from '@mui/material'
import {
  Camera,
  Edit2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store'

export default function DashboardProfilePage() {
  const theme = useTheme()
  const { user } = useAuthStore()

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account security
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 6,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center" sx={{ mb: 6 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    fontWeight: 800,
                    boxShadow: theme.shadows[8],
                  }}
                >
                  {user?.full_name?.[0] || 'U'}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[2],
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'divider' },
                  }}
                  size="small"
                >
                  <Camera size={16} />
                </IconButton>
              </Box>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {user?.full_name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1, mb: 1.5 }}>
                  <Mail size={16} /> {user?.email}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit2 size={14} />}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Full Name
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue={user?.full_name}
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: <UserIcon size={18} style={{ marginRight: 12, color: theme.palette.text.secondary }} />,
                        sx: { borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.02) },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue={user?.email}
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: <Mail size={18} style={{ marginRight: 12, color: theme.palette.text.secondary }} />,
                        sx: { borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.02) },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue={user?.phone || 'Not provided'}
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: <Phone size={18} style={{ marginRight: 12, color: theme.palette.text.secondary }} />,
                        sx: { borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.02) },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 700, color: 'text.secondary' }}>
                    Location
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your city"
                    slotProps={{
                      input: {
                        startAdornment: <MapPin size={18} style={{ marginRight: 12, color: theme.palette.text.secondary }} />,
                        sx: { borderRadius: 4 },
                      },
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" size="large" sx={{ borderRadius: 4, px: 6, fontWeight: 800 }}>
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Status / Sidebar info */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 6,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ color: 'primary.main' }}>
                  <ShieldCheck size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Trust & Safety
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your account is protected with standard encryption. Enable two-factor authentication for enhanced security.
              </Typography>
              <Button variant="text" color="primary" sx={{ fontWeight: 700, p: 0 }}>
                Learn more about security
              </Button>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 6,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Member Highlights
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">TIER</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'secondary.main' }}>Explorer Member</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">JOINED</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recently'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
