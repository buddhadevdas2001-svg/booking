'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Outfit, Poppins } from 'next/font/google'
import { useThemeStore } from '@/store'
import { alpha } from '@mui/material/styles'

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

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch — set mounted to true after first client render
  React.useLayoutEffect(() => {
    setMounted(true)
  }, [])

  // Sync data-theme attribute on <html> so globals.css dark-mode selectors work
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const theme = useMemo(() => {
    const isDark = mode === 'dark'
    
    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDark ? '#60a5fa' : '#3969c5', // Blue 400 in dark, custom blue in light
          light: isDark ? '#93c5fd' : '#4f82e3',
          dark: isDark ? '#2563eb' : '#254ba7',
          contrastText: isDark ? '#0f172a' : '#ffffff',
        },
        secondary: {
          main: '#f5b433',
          light: '#f7c96d',
          dark: '#ba7b14',
          contrastText: '#0f172a',
        },
        background: {
          default: isDark ? '#0f172a' : '#ffffff', // Slate 950 in dark
          paper: isDark ? '#1e293b' : '#f8fafc',    // Slate 800 in dark
        },
        text: {
          primary: isDark ? '#f1f5f9' : '#111827',
          secondary: isDark ? '#94a3b8' : '#64748b',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
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
        borderRadius: 4,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: isDark ? '#334155 #0f172a' : '#cbd5e1 #f8fafc',
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: isDark ? '#0f172a' : '#f8fafc',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: isDark ? '#334155' : '#cbd5e1',
                borderRadius: 20,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              padding: '10px 24px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: isDark 
                    ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
                    : '0 8px 16px rgba(57, 105, 197, 0.15)',
              },
            },
            containedPrimary: {
              background: isDark 
                ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #3969c5 0%, #2b4fa7 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              ...(isDark && {
                backgroundColor: '#1e293b',
              })
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDark
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                borderColor: isDark ? alpha('#60a5fa', 0.2) : '#3969c540',
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
                borderRadius: 4,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(148, 163, 184, 0.4)' : '#cbd5e1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDark ? '#60a5fa' : '#3969c5',
                },
              },
            },
          },
        },
        MuiInputAdornment: {
          styleOverrides: {
            positionStart: {
              marginRight: '12px',
              color: isDark ? alpha('#94a3b8', 0.8) : alpha('#64748b', 0.8),
            },
            positionEnd: {
              marginLeft: '12px',
            },
          },
        },
      },
    })
  }, [mode])

  if (!mounted) {
    return null;
  }

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
