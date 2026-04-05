import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile, Seat } from '@/types/supabase'

// Auth Store
interface AuthState {
    user: Profile | null
    setUser: (user: Profile | null) => void
}
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
        }),
        { name: 'auth-store' }
    )
)

// Booking Store - tracks in-progress seat selection
interface BookingState {
    tripId: string | null
    selectedSeats: Seat[]
    lockedSeats: string[]
    sessionId: string
    setTripId: (tripId: string | null) => void
    toggleSeat: (seat: Seat) => void
    clearSeats: () => void
    setLockedSeats: (seats: string[] | ((prev: string[]) => string[])) => void
    setSessionId: (sessionId: string) => void
    isSeatLocked: (seatLabel: string) => boolean
}
export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            tripId: null,
            selectedSeats: [],
            lockedSeats: [],
            sessionId: '',
            setTripId: (tripId) =>
                set((state) => (
                    state.tripId === tripId
                        ? { tripId }
                        : { tripId, selectedSeats: [], lockedSeats: [] }
                )),
            toggleSeat: (seat) =>
                set((state) => {
                    const exists = state.selectedSeats.find((s) => s.label === seat.label)
                    return {
                        selectedSeats: exists
                            ? state.selectedSeats.filter((s) => s.label !== seat.label)
                            : [...state.selectedSeats, seat],
                    }
                }),
            clearSeats: () => set({ selectedSeats: [], tripId: null, lockedSeats: [] }),
            setLockedSeats: (seats) =>
                set((state) => ({
                    lockedSeats: typeof seats === 'function' ? seats(state.lockedSeats) : seats,
                })),
            setSessionId: (sessionId) => set({ sessionId }),
            isSeatLocked: (seatLabel) => get().lockedSeats.includes(seatLabel),
        }),
        { name: 'booking-store' }
    )
)

// Theme Store
interface ThemeState {
    mode: 'light' | 'dark'
    toggleMode: () => void
    setMode: (mode: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
            setMode: (mode) => set({ mode }),
        }),
        { name: 'theme-store' }
    )
)
