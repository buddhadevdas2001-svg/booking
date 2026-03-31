'use client'

import React, { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu as MenuIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Box,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  alpha,
  useTheme,
  Container,
} from '@mui/material'
import AdminSidebar from '@/components/admin/AdminSidebar'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Admin Overview', subtitle: 'Track operations, revenue, and fleet activity in one place.' },
  '/admin/buses': { title: 'Fleet Management', subtitle: 'Keep bus inventory, seat counts, and amenities up to date.' },
  '/admin/layouts': { title: 'Seat Layout Studio', subtitle: 'Design templates that stay consistent across your fleet.' },
  '/admin/routes': { title: 'Route Operations', subtitle: 'Organize corridors, stop patterns, and journey durations.' },
  '/admin/trips': { title: 'Trip Scheduling', subtitle: 'Manage departures, arrivals, fares, and live trip status.' },
  '/admin/bookings': { title: 'Booking Management', subtitle: 'View and manage all customer bookings and transactions.' },
  '/admin/payments': { title: 'Payment Management', subtitle: 'Monitor transactions, refunds, and payment gateway performance.' },
  '/admin/staff': { title: 'Staff Management', subtitle: 'Manage drivers, conductors, and support staff.' },
  '/admin/analytics': { title: 'Analytics Dashboard', subtitle: 'Track performance metrics and business insights.' },
  '/admin/settings': { title: 'System Settings', subtitle: 'Configure system preferences and operational parameters.' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageMeta = useMemo(() => {
    return (
      pageTitles[pathname] ?? {
        title: 'Admin Workspace',
        subtitle: 'Manage your bus booking platform with a cleaner operational view.',
      }
    )
  }, [pathname])

  const sidebarWidth = collapsed ? 80 : 280

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ml: { lg: `${sidebarWidth}px` },
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 4, lg: 6 }, py: 1.5 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { lg: 'none' }, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', mb: 0.5 }}>
                Operations
              </Typography>
              <Typography variant="h5" noWrap sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                {pageMeta.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
                {pageMeta.subtitle}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 4, lg: 6 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
