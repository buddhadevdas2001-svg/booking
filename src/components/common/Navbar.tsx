'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useScrollTrigger,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Fade,
  Stack,
} from '@mui/material'
import {
  Search,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Ticket,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import Brand from '@/components/common/Brand'
import { useThemeStore } from '@/store'
import { useTheme, alpha } from '@mui/material/styles'

type NavLinkItem = {
  href: string
  label: string
  icon?: React.ElementType
}

const navLinks: NavLinkItem[] = [
  { href: '/search', label: 'Bus Search', icon: Search },
  { href: '/dashboard/bookings', label: 'My Tickets', icon: Ticket },
  { href: '/dashboard', label: 'Account', icon: User },
]

const homeNavLinks: NavLinkItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/dashboard/bookings', label: 'My Bookings' },
]

export default function Navbar() {
  const { user, setUser } = useAuthStore()
  const { mode, toggleMode } = useThemeStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openUserMenu = Boolean(anchorEl)

  const isPublicPage = pathname === '/' || pathname === '/about' || pathname === '/contact' || pathname === '/dashboard/bookings'
  const desktopLinks = isPublicPage ? homeNavLinks : navLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMobileOpen(false)
    setUser(null)
    setAnchorEl(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderBottom: trigger ? '1px solid' : 'none',
          borderColor: 'divider',
          height: { xs: 72, md: 88 },
          display: 'flex',
          justifyContent: 'center',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Brand compact={false} />

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1, alignItems: 'center' }}>
              {desktopLinks.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '1rem',
                      px: 2,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        color: 'primary.main',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 20,
                            height: 3,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                          }
                        : {},
                    }}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <IconButton
                onClick={toggleMode}
                sx={{
                  color: 'text.primary',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    transform: 'rotate(15deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>

              {user ? (
                <>
                  <Button
                    onClick={handleUserMenuClick}
                    startIcon={
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'secondary.main',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                        }}
                      >
                        {user.full_name?.[0] || 'U'}
                      </Avatar>
                    }
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      color: 'text.primary',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    {user.full_name?.split(' ')[0]}
                  </Button>
                  <IconButton
                    onClick={handleUserMenuClick}
                    sx={{
                      display: { xs: 'flex', sm: 'none' },
                      color: 'text.primary'
                    }}
                  >
                    <User size={24} />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={openUserMenu}
                    onClose={handleUserMenuClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 1,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: theme.palette.background.paper,
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {user.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email || 'No email provided'}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} href="/dashboard" onClick={handleUserMenuClose}>
                      Dashboard
                    </MenuItem>
                    <MenuItem component={Link} href="/admin" onClick={handleUserMenuClose} sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Admin Panel
                    </MenuItem>
                    <MenuItem component={Link} href="/dashboard/bookings" onClick={handleUserMenuClose}>
                      My Bookings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <ListItemIcon sx={{ color: 'error.main', minWidth: 32 }}>
                        <LogOut size={18} />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => router.push('/auth/login')}
                    sx={{
                      display: { xs: 'none', lg: 'flex' },
                      borderRadius: '50px',
                      px: 3,
                      py: 1,
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/auth/register')}
                    startIcon={<User size={18} />}
                    sx={{
                      display: { xs: 'none', lg: 'flex' },
                      borderRadius: '50px',
                      px: 3,
                      py: 1,
                      fontSize: '1rem',
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': { boxShadow: '0 4px 12px rgba(57, 105, 197, 0.3)' },
                    }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              )}

              <IconButton
                aria-label="Open navigation menu"
                aria-haspopup={true}
                edge="end"
                onClick={() => setMobileOpen(true)}
                sx={{
                  display: { lg: 'none' },
                  ml: 0.5,
                  color: 'text.primary'
                }}
              >
                <MenuIcon size={28} />
              </IconButton>
            </Box>


          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 360,
            bgcolor: 'background.default',
            p: 2,
          },
        }}
      >
        <Box role="navigation" aria-label="Mobile navigation" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, mt: 1 }}>
          <Brand compact />
          <IconButton onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 4, p: 2, bgcolor: isPublicPage ? 'rgba(57, 105, 197, 0.05)' : 'action.hover', borderRadius: 4 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
            {user ? 'Signed In' : 'Guest Mode'}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>
            {user?.full_name || 'Ready to travel?'}
          </Typography>
          {!user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Join Voyatra for exclusive travel deals.
            </Typography>
          )}
        </Box>

        <List sx={{ mb: 4 }}>
          {desktopLinks.map((link) => {
            const Icon = link.icon
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <ListItem key={link.href} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: 3 }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {Icon ? <Icon size={20} /> : <ChevronRight size={20} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
          {user && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href="/admin"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <ChevronRight size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Panel"
                  primaryTypographyProps={{ fontWeight: 800, fontSize: '1.1rem', color: 'primary.main' }}
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>

        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {user ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogOut size={20} />}
              onClick={handleLogout}
              sx={{ py: 1.5, borderRadius: 3 }}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setMobileOpen(false)
                  router.push('/auth/login')
                }}
                sx={{ py: 1.5, borderRadius: 3 }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setMobileOpen(false)
                  router.push('/auth/register')
                }}
                sx={{ py: 1.5, borderRadius: 3 }}
              >
                Create Account
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  )
}
