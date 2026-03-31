import { Card as MuiCard, CardProps } from '@mui/material'
import React from 'react'

export function Card({ children, className = '', ...props }: { children: React.ReactNode; className?: string } & CardProps) {
    return (
        <MuiCard className={className} {...props}>
            {children}
        </MuiCard>
    )
}
