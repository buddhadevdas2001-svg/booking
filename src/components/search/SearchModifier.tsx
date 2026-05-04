'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  alpha,
  useTheme,
  IconButton,
  Typography,
  Stack,
} from '@mui/material'
import { Search, MapPin, Calendar, ArrowLeftRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getCities } from '@/lib/api'

interface SearchModifierProps {
  initialFrom: string
  initialTo: string
  initialDate: string
  onUpdate: (params: { from: string; to: string; date: string }) => void
}

export default function SearchModifier({ initialFrom, initialTo, initialDate, onUpdate }: SearchModifierProps) {
  const theme = useTheme()
  const [params, setParams] = useState({ from: initialFrom, to: initialTo, date: initialDate })

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  })

  useEffect(() => {
    setParams({ from: initialFrom, to: initialTo, date: initialDate })
  }, [initialFrom, initialTo, initialDate])

  const handleSwap = () => {
    setParams(prev => ({ ...prev, from: prev.to, to: prev.from }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(params)
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        p: { xs: 2, md: 1.2 },
        borderRadius: { xs: 4, md: 100 },
        border: '1px solid',
        borderColor: alpha('#ffffff', 0.5),
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
        position: 'relative',
        mx: 'auto',
        maxWidth: 1150,
        width: '100%',
        gap: { xs: 2, md: 0 },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:focus-within': {
          boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.12)}, inset 0 0 0 1.5px ${alpha(theme.palette.primary.main, 0.2)}`,
          transform: 'translateY(-2px)',
        }
      }}
    >
      {/* Origin */}
      <Box sx={{ 
        flex: 1.2, 
        width: { xs: '100%', md: 'auto' }, 
        minWidth: { xs: 'none', md: 200 }, 
        display: 'flex', 
        alignItems: 'center', 
        pl: { xs: 2, md: 4 }, 
        pr: 2 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 44, 
          height: 44, 
          borderRadius: '50%', 
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          mr: 2,
          flexShrink: 0
        }}>
          <MapPin size={22} color={theme.palette.primary.main} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: alpha('#000000', 0.4), fontWeight: 800, display: 'block', mb: 0, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Origin</Typography>
          <select
            value={params.from}
            onChange={(e) => setParams(prev => ({ ...prev, from: e.target.value }))}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#0f172a',
              fontSize: '1.15rem',
              fontWeight: 800,
              appearance: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              textOverflow: 'ellipsis',
            }}
          >
            <option value="" disabled>Select Origin</option>
            {cities.filter(c => c !== params.to).map((city) => (
              <option key={city} value={city} style={{ color: '#000' }}>{city}</option>
            ))}
          </select>
        </Box>
      </Box>

      {/* Swap Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, px: 1, flexDirection: { xs: 'row', md: 'row' } }}>
        <Box sx={{ width: { xs: 40, md: 1.5 }, height: { xs: 1.5, md: 40 }, bgcolor: alpha('#000000', 0.08), display: { xs: 'none', md: 'block' } }} />
        <IconButton 
          onClick={handleSwap}
          sx={{ 
            bgcolor: '#fff',
            color: theme.palette.primary.main,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: `1px solid ${alpha('#000', 0.05)}`,
            '&:hover': { 
              bgcolor: theme.palette.primary.main, 
              color: '#fff',
              transform: { xs: 'rotate(90deg) scale(1.1)', md: 'rotate(180deg) scale(1.1)' },
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`
            },
            width: 44,
            height: 44,
            mx: { xs: 0, md: 1.5 },
            transform: { xs: 'rotate(90deg)', md: 'none' },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <ArrowLeftRight size={20} />
        </IconButton>
        <Box sx={{ width: { xs: 40, md: 1.5 }, height: { xs: 1.5, md: 40 }, bgcolor: alpha('#000000', 0.08), display: { xs: 'none', md: 'block' } }} />
      </Box>

      {/* Destination */}
      <Box sx={{ 
        flex: 1.2, 
        width: { xs: '100%', md: 'auto' },
        minWidth: { xs: 'none', md: 200 }, 
        display: 'flex', 
        alignItems: 'center', 
        pl: { xs: 2, md: 2 }, 
        pr: 2 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 44, 
          height: 44, 
          borderRadius: '50%', 
          bgcolor: alpha(theme.palette.secondary.main, 0.08),
          mr: 2,
          flexShrink: 0
        }}>
          <MapPin size={22} color={theme.palette.secondary.main} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: alpha('#000000', 0.4), fontWeight: 800, display: 'block', mb: 0, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Destination</Typography>
          <select
            value={params.to}
            onChange={(e) => setParams(prev => ({ ...prev, to: e.target.value }))}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#0f172a',
              fontSize: '1.15rem',
              fontWeight: 800,
              appearance: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              textOverflow: 'ellipsis',
            }}
          >
            <option value="" disabled>Select Destination</option>
            {cities.filter(c => c !== params.from).map((city) => (
              <option key={city} value={city} style={{ color: '#000' }}>{city}</option>
            ))}
          </select>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, px: 1 }}>
        <Box sx={{ width: 1.5, height: 40, bgcolor: alpha('#000000', 0.08) }} />
      </Box>

      {/* Date */}
      <Box sx={{ 
        flex: 1, 
        width: { xs: '100%', md: 'auto' },
        minWidth: { xs: 'none', md: 180 }, 
        display: 'flex', 
        alignItems: 'center', 
        pl: { xs: 2, md: 3 }, 
        pr: 2 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 44, 
          height: 44, 
          borderRadius: '50%', 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          mr: 2,
          flexShrink: 0
        }}>
          <Calendar size={22} color={theme.palette.primary.main} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: alpha('#000000', 0.4), fontWeight: 800, display: 'block', mb: 0, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Date</Typography>
          <input
            type="date"
            className="custom-date-input"
            value={params.date}
            onChange={(e) => setParams(prev => ({ ...prev, date: e.target.value }))}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#0f172a',
              fontSize: '1.15rem',
              fontWeight: 800,
              fontFamily: 'inherit',
              padding: '2px 0',
              WebkitAppearance: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          />
        </Box>
      </Box>

      <Button
        type="submit"
        variant="contained"
        disableElevation
        sx={{ 
          borderRadius: { xs: 3, md: '50%' }, 
          minWidth: { xs: '100%', md: 64 },
          width: { xs: '100%', md: 64 },
          height: { xs: 54, md: 64 },
          p: 0,
          ml: { xs: 0, md: 1 },
          mr: { xs: 0, md: 0.5 },
          background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
          boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            transform: { xs: 'none', md: 'scale(1.08) rotate(5deg)' },
            boxShadow: '0 15px 30px rgba(37, 99, 235, 0.35)',
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          mt: { xs: 2, md: 0 }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Search size={22} color="#fff" strokeWidth={2.5} />
          <Typography sx={{ fontWeight: 800, color: '#fff' }}>Search Buses</Typography>
        </Stack>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Search size={28} color="#fff" strokeWidth={2.5} />
        </Box>
      </Button>

      <Box sx={{ 
        '& .custom-date-input::-webkit-calendar-picker-indicator': {
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          cursor: 'pointer',
          opacity: 0,
        }
      }} />
    </Box>
  )
}
