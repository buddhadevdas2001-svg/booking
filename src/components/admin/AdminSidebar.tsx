'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bus,
  Calendar,
  CreditCard,
  LayoutGrid,
  LogOut,
  Map,
  Settings,
  Ticket,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Tag,
} from 'lucide-react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  alpha,
  useTheme,
  Tooltip,
  Stack,
} from '@mui/material'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import Brand from '@/components/common/Brand'
import { useThemeStore } from '@/store'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
  { href: '/admin/buses', label: 'Buses', icon: Bus },
  { href: '/admin/layouts', label: 'Seat Layouts', icon: LayoutGrid },
  { href: '/admin/routes', label: 'Routes', icon: Map },
  { href: '/admin/trips', label: 'Trips', icon: Calendar },
  { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

type AdminSidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const theme = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const { mode, toggleMode } = useThemeStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Logged out successfully')
    onCloseMobile()
    router.push('/auth/login')
  }

  const sidebarWidth = collapsed ? 80 : 280

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Brand */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ 
        p: '24px 16px', 
        minHeight: 88,
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Brand 
            compact 
            iconOnly={collapsed} 
            href="/admin" 
          />
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>Voyatra Admin</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Management</Typography>
            </Box>
          )}
        </Box>
        
        {mobileOpen && (
          <IconButton onClick={onCloseMobile} sx={{ display: { lg: 'none' } }}>
            <X size={20} />
          </IconButton>
        )}
      </Stack>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      {/* Collapse Toggle */}
      <Box sx={{ p: 2, display: { xs: 'none', lg: 'block' } }}>
        <IconButton
          onClick={onToggleCollapse}
          sx={{
            width: '100%',
            borderRadius: 3,
            bgcolor: alpha(theme.palette.divider, 0.03),
            '&:hover': { bgcolor: alpha(theme.palette.divider, 0.08) }
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1 }}>
        <List>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={onCloseMobile}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.divider, 0.05),
                        color: isActive ? 'primary.main' : 'text.primary',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
                      <item.icon size={20} />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 800 : 600 }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>
      </Box>

      {/* User Info & Logout */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{
          p: 2,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.divider, 0.03),
          mb: 2,
          display: collapsed ? 'none' : 'block'
        }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Signed In</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {user?.email?.split('@')[0] || 'Admin'}
          </Typography>
        </Box>

        <Divider sx={{ mx: 2, my: 1, opacity: 0.5 }} />

        <ListItemButton
          onClick={toggleMode}
          sx={{
            borderRadius: 3,
            py: 1.5,
            mb: 0.5,
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 800 }}
            />
          )}
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            py: 1.5,
            color: 'error.main',
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
            <LogOut size={20} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 800 }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {sidebarContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </>
  )
}
