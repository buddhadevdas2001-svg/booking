'use client'

import React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Outfit, Poppins } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3969c5',
      light: '#4f82e3',
      dark: '#254ba7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f5b433',
      light: '#f7c96d',
      dark: '#ba7b14',
      contrastText: '#0f172a',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    text: {
      primary: '#111827',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: poppins.style.fontFamily,
    h1: { fontFamily: outfit.style.fontFamily, fontWeight: 800 },
    h2: { fontFamily: outfit.style.fontFamily, fontWeight: 800 },
    h3: { fontFamily: outfit.style.fontFamily, fontWeight: 700 },
    h4: { fontFamily: outfit.style.fontFamily, fontWeight: 700 },
    h5: { fontFamily: outfit.style.fontFamily, fontWeight: 600 },
    h6: { fontFamily: outfit.style.fontFamily, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(57, 105, 197, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3969c5 0%, #2b4fa7 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
            borderColor: '#3969c540',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#f8fafc',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3969c5',
            },
          },
        },
      },
    },
  },
})

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
