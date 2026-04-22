'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  alpha,
  useTheme,
} from '@mui/material'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

const GLASS_STYLE = (theme: any) => ({
  backdropFilter: 'blur(12px)',
  backgroundColor: theme.palette.mode === 'dark' ? alpha('#1e293b', 0.8) : alpha('#fff', 0.8),
  border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
})

interface HomeSearchFormProps {
  cities: string[]
}

export default function HomeSearchForm({ cities }: HomeSearchFormProps) {
  const router = useRouter()
  const theme = useTheme()
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
  })
  
  const [today] = useState(() => {
    const localToday = new Date()
    localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset())
    return localToday.toISOString().split('T')[0]
  })

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
        toast.error('Please fill in all search fields')
        return
    }
    setIsSearching(true)
    router.push(
      `/search?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${searchParams.date}`
    )
  }

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 1, ...GLASS_STYLE(theme) }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Quick Search</Typography>
        <Chip 
          label="Daily Service" 
          size="small" 
          color="success" 
          sx={{ fontWeight: 800, borderRadius: 1, height: 24 }} 
        />
      </Stack>
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select fullWidth label="From"
              value={searchParams.from}
              onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
              required
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city} disabled={city === searchParams.to}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select fullWidth label="To"
              value={searchParams.to}
              onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
              required
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city} disabled={city === searchParams.from}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          fullWidth label="Departure Date" type="date"
          value={searchParams.date}
          onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          required
        />
        <Button
          type="submit" fullWidth variant="contained" size="large"
          disabled={isSearching} startIcon={<Search />}
          sx={{ mt: 1, py: 2, borderRadius: 1, fontWeight: 900, fontSize: '1.1rem' }}
        >
          {isSearching ? 'Searching...' : 'Search Buses'}
        </Button>
      </Box>
    </Paper>
  )
}
