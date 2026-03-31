'use client'

import React from 'react'
import Navbar from '@/components/common/Navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Ticket,
  User,
  Settings,
  CreditCard,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Divider,
  Avatar,
} from '@mui/material'
import { useAuthStore } from '@/store'

const navItems = [
  { href: '/dashboard', label: 'Profile Settings', icon: User, exact: true },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: Ticket },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
  { href: '/dashboard/preferences', label: 'Preferences', icon: Settings },
]

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const theme = useTheme()
  const { user } = useAuthStore()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      <Container maxWidth="xl" sx={{ flex: 1, pt: { xs: 4, md: 6 }, pb: 8 }}>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 100 }}>
              {/* User Profile Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 700,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  {user?.full_name?.[0] || 'U'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {user?.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {user?.email}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    typography: 'caption',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Verified Account
                </Box>
              </Paper>

              {/* Navigation */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    pt: 1,
                    pb: 2,
                    display: 'block',
                    fontWeight: 800,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  My Account
                </Typography>
                <Stack spacing={0.5}>
                  {navItems.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    return (
                      <Button
                        key={item.href}
                        component={Link}
                        href={item.href}
                        startIcon={<item.icon size={18} />}
                        endIcon={isActive && <ChevronRight size={16} />}
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          px: 2,
                          py: 1.2,
                          borderRadius: 3,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'primary.main' : 'text.secondary',
                          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          '&:hover': {
                            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.divider, 0.05),
                            color: isActive ? 'primary.main' : 'text.primary',
                          },
                          '& .MuiButton-startIcon': {
                            color: isActive ? 'primary.main' : 'text.secondary',
                            mr: 1.5,
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    )
                  })}
                  <Divider sx={{ my: 1, mx: 1 }} />
                  <Button
                    startIcon={<LogOut size={18} />}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1.2,
                      borderRadius: 3,
                      fontWeight: 500,
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                      },
                      '& .MuiButton-startIcon': {
                        mr: 1.5,
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Main Content */}
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            <Box sx={{ minHeight: '60vh' }}>
              {children}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
