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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import Brand from '@/components/common/Brand'

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
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isHome = pathname === '/'
  const desktopLinks = isHome ? homeNavLinks : navLinks

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openUserMenu = Boolean(anchorEl)

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  })

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
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: { xs: 72, md: 88 },
          display: 'flex',
          justifyContent: 'center',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Brand compact={false} dark={false} />

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
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '1rem',
                      px: 2,
                      '&:hover': {
                        bgcolor: 'rgba(57, 105, 197, 0.05)',
                        color: 'primary.main',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': isActive ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20,
                        height: 3,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                      } : {},
                    }}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                      bgcolor: 'rgba(57, 105, 197, 0.05)',
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 2,
                      py: 1,
                    }}
                  >
                    {user.full_name?.split(' ')[0]}
                  </Button>
                  <IconButton
                    onClick={handleUserMenuClick}
                    sx={{ display: { xs: 'flex', sm: 'none' }, color: isHome ? 'text.primary' : 'white' }}
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
                        borderRadius: 3,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
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
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => router.push('/auth/login')}
                    sx={{
                      display: { xs: 'none', lg: 'flex' },
                      borderRadius: '50px',
                      px: 3,
                      py: 1,
                      fontSize: '1rem',
                      fontWeight: 700,
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
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(57, 105, 197, 0.3)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              )}

              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={() => setMobileOpen(true)}
                sx={{ display: { lg: 'none' }, ml: 1 }}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, mt: 1 }}>
          <Brand compact />
          <IconButton onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 4, p: 2, bgcolor: isHome ? 'rgba(57, 105, 197, 0.05)' : 'action.hover', borderRadius: 4 }}>
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
            return (
              <ListItem key={link.href} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: 3 }}
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
      <Toolbar sx={{ height: { xs: 72, md: 88 } }} />
    </>
  )
}
