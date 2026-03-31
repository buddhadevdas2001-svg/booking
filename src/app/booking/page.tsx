'use client'

import { FormEvent, useState, type ComponentProps, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Bus, CalendarDays, Clock, MapPin, Shield, Users } from 'lucide-react'
import Navbar from '@/components/common/Navbar'

const cityOptions = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Goa',
  'Ahmedabad',
  'Jaipur',
  'Kolkata',
]

export default function BookingPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.from || !form.to || !form.date) return

    router.push(
      `/search?from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}&date=${form.date}&passengers=${form.passengers}`,
    )
  }

  const quickRoutes = [
    { from: 'Delhi', to: 'Jaipur', duration: '4h 50m' },
    { from: 'Mumbai', to: 'Pune', duration: '3h 20m' },
    { from: 'Chennai', to: 'Bangalore', duration: '5h 10m' },
  ]

  const steps = [
    { title: 'Search & Compare', desc: 'Find real-time buses, fares, amenities, and ratings.', icon: SearchIcon },
    { title: 'Pick Your Seat', desc: 'Live seat layout with instant locking for 5 minutes.', icon: SeatIcon },
    { title: 'Pay Securely', desc: 'Stripe checkout with cards and UPI, instant e-ticket.', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="pt-20 pb-14">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-8 shadow-2xl">
              <p className="eyebrow text-blue-100">Bus Booking</p>
              <h1 className="mb-2 text-3xl font-extrabold sm:text-4xl">Plan your trip in minutes</h1>
              <p className="mb-6 text-slate-200">
                Choose your cities, date, and seats. We show live inventory, amenities, and fares so you can book with
                confidence.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="From"
                    value={form.from}
                    onChange={(value) => setForm((prev) => ({ ...prev, from: value }))}
                    placeholder="Pick-up city"
                    icon={<MapPin size={16} />}
                  />
                  <Field
                    label="To"
                    value={form.to}
                    onChange={(value) => setForm((prev) => ({ ...prev, to: value }))}
                    placeholder="Drop-off city"
                    icon={<MapPin size={16} />}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Travel date"
                    type="date"
                    value={form.date}
                    onChange={(value) => setForm((prev) => ({ ...prev, date: value }))}
                    icon={<CalendarDays size={16} />}
                  />
                  <Field
                    label="Passengers"
                    type="number"
                    min={1}
                    max={6}
                    value={form.passengers}
                    onChange={(value) => setForm((prev) => ({ ...prev, passengers: value }))}
                    icon={<Users size={16} />}
                  />
                </div>

                <datalist id="city-options">
                  {cityOptions.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>

                <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2 text-base">
                  <Bus size={18} />
                  <span>Search buses</span>
                  <ArrowRight size={18} />
                </button>

                <div className="flex flex-wrap gap-2 text-xs text-blue-100/80">
                  <Badge icon={<Shield size={12} />}>Instant e-ticket</Badge>
                  <Badge icon={<Clock size={12} />}>5 min seat hold</Badge>
                  <Badge icon={<Bus size={12} />}>Live availability</Badge>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className="card bg-slate-900/40 border-slate-800 text-white">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Bus size={18} className="text-blue-400" />
                  Popular quick picks
                </h3>
                <div className="space-y-3">
                  {quickRoutes.map((route) => (
                    <Link
                      key={`${route.from}-${route.to}`}
                      href={`/search?from=${route.from}&to=${route.to}&date=${form.date || ''}&passengers=${form.passengers}`}
                      className="card-hover border-slate-800 bg-slate-900/60 p-4 text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {route.from} → {route.to}
                          </p>
                          <p className="text-xs text-slate-400">{route.duration} • AC / Sleeper options</p>
                        </div>
                        <ArrowRight size={16} className="text-blue-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card bg-slate-900/40 border-slate-800 text-white">
                <h3 className="mb-4 text-lg font-semibold">How it works</h3>
                <div className="space-y-3">
                  {steps.map((step) => (
                    <div key={step.title} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                        <step.icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{step.title}</p>
                        <p className="text-sm text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  min?: number
  max?: number
  icon?: React.ReactNode
}

function Field({ label, value, onChange, placeholder, type = 'text', min, max, icon }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <div className="relative mt-2">
        {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span> : null}
        <input
          type={type}
          min={min}
          max={max}
          list={['text', 'search'].includes(type) ? 'city-options' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input bg-white/5 text-white placeholder:text-slate-400 ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </label>
  )
}

function Badge({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
      {icon}
      {children}
    </span>
  )
}

function SearchIcon(props: ComponentProps<typeof ArrowRight>) {
  return <ArrowRight {...props} />
}

function SeatIcon(props: ComponentProps<typeof Users>) {
  return <Users {...props} />
}
