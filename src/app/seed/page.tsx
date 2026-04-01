'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Database,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'
import { seedDatabase } from '@/lib/seed'
import Navbar from '@/components/common/Navbar'

export default function SeedPage() {
  const theme = useTheme()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  const handleSeed = async () => {
    setStatus('loading')
    setError(null)
    setLogs([])
    addLog('Starting seeding process...')
    
    try {
      // Intercept console.log to show on screen
      const originalLog = console.log
      console.log = (...args) => {
        addLog(args.join(' '))
        originalLog(...args)
      }

      await seedDatabase()
      setStatus('success')
      addLog('Seeding completed successfully!')
      
      // Restore console.log
      console.log = originalLog
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during seeding.'
      console.error('Seeding UI Error:', err)
      setStatus('error')
      setError(message)
      addLog(`ERROR: ${message}`)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowLeft size={18} />}
              sx={{ mb: 2, fontWeight: 700 }}
            >
              Back to Home
            </Button>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>
              Database Seeder
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400 }}>
              Populate your Supabase tables with sample routes, buses, and trips.
            </Typography>
          </Box>

          <Alert 
            severity="warning" 
            icon={<AlertTriangle />} 
            sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.warning.main, 0.05) }}
          >
            <AlertTitle sx={{ fontWeight: 800 }}>Before you seed</AlertTitle>
            Ensure you have already ran the <strong>SQL migrations</strong> in your Supabase SQL Editor. 
            The seeder expects tables like <code>routes</code>, <code>buses</code>, and <code>trips</code> to exist.
          </Alert>

          {/* Main Action Area */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 6, 
              border: '1px solid', 
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: 'primary.main',
                }}
              >
                <Database size={48} />
              </Box>

              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  Initialize Sample Data
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                  This seeds a realistic agency setup: routes, buses, seat-layout templates, future trips, coupons,
                  offers, staff assignments, and sample bookings.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={status === 'loading'}
                onClick={handleSeed}
                startIcon={status === 'loading' ? <CircularProgress size={20} color="inherit" /> : <PlayCircle />}
                sx={{ 
                  px: 6, 
                  py: 2, 
                  borderRadius: 4, 
                  fontSize: '1.1rem', 
                  fontWeight: 800,
                  boxShadow: theme.shadows[8],
                }}
              >
                {status === 'loading' ? 'Seeding in Progress...' : 'Start Seeding'}
              </Button>
            </Stack>
          </Paper>

          {/* Logs Section */}
          {(logs.length > 0 || status !== 'idle') && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0, 
                borderRadius: 6, 
                overflow: 'hidden',
                border: '1px solid', 
                borderColor: 'divider',
                bgcolor: '#0f172a', // Dark console theme
                color: '#e2e8f0',
              }}
            >
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Terminal size={16} />
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Execution Logs
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <List sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                {logs.map((log, i) => (
                  <ListItem key={i} dense sx={{ p: 0, minHeight: 'auto' }}>
                    <ListItemText 
                      primary={log} 
                      primaryTypographyProps={{ 
                        variant: 'caption', 
                        sx: { 
                          fontFamily: 'monospace', 
                          color: log.includes('ERROR') ? 'error.light' : 'inherit',
                          fontSize: '0.8rem'
                        } 
                      }} 
                    />
                  </ListItem>
                ))}
                {status === 'loading' && (
                  <ListItem dense sx={{ p: 0 }}>
                    <CircularProgress size={12} sx={{ mr: 1, color: 'primary.light' }} />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontStyle: 'italic', color: 'primary.light' }}>
                      Working...
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          )}

          {/* Success Result */}
          {status === 'success' && (
            <Alert 
              severity="success" 
              icon={<CheckCircle2 />}
              sx={{ borderRadius: 4 }}
              action={
                <Button color="inherit" size="small" component={Link} href="/" sx={{ fontWeight: 700 }}>
                  Go to Home
                </Button>
              }
            >
              <AlertTitle sx={{ fontWeight: 800 }}>Success!</AlertTitle>
              Your database has been seeded with sample fleet data. You can now test the booking and search flows.
            </Alert>
          )}

          {/* Error Result */}
          {status === 'error' && (
            <Alert 
              severity="error" 
              sx={{ borderRadius: 4 }}
            >
              <AlertTitle sx={{ fontWeight: 800 }}>Seeding Failed</AlertTitle>
              {error}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Possible fixes:</Typography>
                <Typography variant="body2">• Ensure tables exist in Supabase Dashboard.</Typography>
                <Typography variant="body2">• Check if your Service Role Key has enough permissions.</Typography>
              </Box>
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
