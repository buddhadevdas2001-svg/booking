import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import QueryProvider from '@/components/providers/QueryProvider'
import ThemeRegistry from '@/components/providers/ThemeRegistry'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'Voyatra - Bus Booking Platform',
  description: 'Book bus tickets online with Voyatra. Fast, elegant and reliable bus booking for modern travelers.',
  keywords: 'Voyatra, bus booking, online tickets, seat selection, travel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeRegistry>
            <AuthProvider>
                {children}
            </AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                className: '',
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#1e293b' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
                },
              }}
            />
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  )
}
