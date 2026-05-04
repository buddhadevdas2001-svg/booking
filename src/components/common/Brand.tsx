'use client'

import Link from 'next/link'
import { Box, Typography, styled } from '@mui/material'
import { cn } from '@/lib/utils'

type BrandProps = {
  className?: string
  dark?: boolean
  compact?: boolean
  iconOnly?: boolean
  href?: string
}

const LogoBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'dark' && prop !== 'compact',
})<{ dark?: boolean; compact?: boolean }>(({ theme, dark, compact }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: compact ? '1rem' : '1.3rem',
  height: compact ? 40 : 56,
  width: compact ? 40 : 56,
  transition: 'transform 0.3s ease-in-out',
  background: dark
    ? 'linear-gradient(135deg, #f7c96d 0%, #ba7b14 100%)'
    : 'linear-gradient(135deg, #3969c5 0%, #2b4fa7 100%)',
  boxShadow: dark
    ? '0 4px 12px rgba(186, 123, 20, 0.2)'
    : '0 4px 12px rgba(57, 105, 197, 0.2)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}))

export default function Brand({
  className,
  dark = false,
  compact = false,
  iconOnly = false,
  href = '/',
}: BrandProps) {
  return (
    <Box
      component={Link}
      href={href}
      className={className}
      sx={{
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        '&:hover .brand-text': {
          color: dark ? 'secondary.light' : 'primary.main',
        },
      }}
    >
      <LogoBox dark={dark} compact={compact}>
        <Box sx={{ position: 'absolute', inset: '2px', borderRadius: 'inherit', bgcolor: 'rgba(255,255,255,0.12)' }} />
        <Box sx={{ position: 'absolute', inset: '8px', borderRadius: '0.95rem', border: '1px solid rgba(255,255,255,0.16)' }} />
        <Box sx={{ position: 'absolute', left: '50%', top: '50%', height: '64%', width: '64%', transform: 'translate(-50%, -50%)', borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', filter: 'blur(2px)' }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography
            variant="h4"
            className="outfit"
            sx={{
              color: 'white',
              fontSize: compact ? '1rem' : '1.45rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            V
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: compact ? '0.78rem' : '1.05rem',
              mt: 1,
              ml: -0.5,
              fontWeight: 700,
            }}
          >
            /
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', bottom: '0.82rem', left: '50%', height: '2px', width: '44%', transform: 'translateX(-50%)', borderRadius: 999, bgcolor: 'rgba(255,255,255,0.4)' }} />
      </LogoBox>

      {!iconOnly && (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <Typography
            variant="h4"
            className="brand-text outfit"
            sx={{
              fontWeight: 800,
              fontSize: compact ? '1.45rem' : '2.05rem',
              letterSpacing: '-0.05em',
              color: dark ? 'white' : 'text.primary',
              transition: 'color 0.3s ease',
            }}
          >
            Voyatra
          </Typography>
          {!compact && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.32em',
                color: dark ? 'secondary.main' : 'primary.main',
                fontSize: '0.66rem',
                mt: -0.5,
              }}
            >
              Travel Club
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}
