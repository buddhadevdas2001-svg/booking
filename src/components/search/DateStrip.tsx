'use client'

import { Box, Typography, alpha, useTheme } from '@mui/material'
import { format, addDays, isSameDay } from 'date-fns'
import { useRef, useEffect } from 'react'

interface DateStripProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function DateStrip({ selectedDate, onDateChange }: DateStripProps) {
  const theme = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  useEffect(() => {
    // Scroll to selected date on mount
    const selectedIdx = dates.findIndex(d => format(d, 'yyyy-MM-dd') === selectedDate)
    if (selectedIdx !== -1 && scrollRef.current) {
      const el = scrollRef.current.children[selectedIdx] as HTMLElement
      if (el) {
        scrollRef.current.scrollTo({
          left: el.offsetLeft - scrollRef.current.offsetWidth / 2 + el.offsetWidth / 2,
          behavior: 'smooth'
        })
      }
    }
  }, [selectedDate])

  return (
    <Box sx={{ 
      width: '100%', 
      overflowX: 'auto', 
      py: 1,
      '&::-webkit-scrollbar': { display: 'none' }, 
      msOverflowStyle: 'none', 
      scrollbarWidth: 'none' 
    }}>
      <Box sx={{ display: 'inline-flex', minWidth: '100%', justifyContent: 'center' }}>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 2,
            px: 2,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
          }}
        >
      {dates.map((date, i) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const isSelected = dateStr === selectedDate
        const isToday = isSameDay(date, new Date())

        return (
          <Box
            key={dateStr}
            onClick={() => onDateChange(dateStr)}
            sx={{
              flexShrink: 0,
              minWidth: 100,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isSelected 
                ? theme.palette.primary.main
                : alpha('#ffffff', 0.05),
              color: isSelected ? '#ffffff' : alpha('#ffffff', 0.7),
              border: '1px solid',
              borderColor: isSelected ? theme.palette.primary.main : alpha('#ffffff', 0.1),
              borderBottomWidth: isSelected ? 4 : 1,
              borderBottomColor: isSelected ? '#3b82f6' : alpha('#ffffff', 0.1),
              boxShadow: isSelected ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
              '&:hover': {
                background: isSelected 
                  ? theme.palette.primary.main
                  : alpha('#ffffff', 0.1),
              },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', mb: 0.5, color: isSelected ? '#ffffff' : alpha('#ffffff', 0.9) }}>
              {isToday ? 'Today' : format(date, 'EEE')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
              {format(date, 'dd MMM')} | ₹{899 + (i * 50)}
            </Typography>
          </Box>
        )
      })}
      </Box>
      </Box>
    </Box>
  )
}
