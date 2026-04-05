'use client'

import Navbar from '@/components/common/Navbar'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-shell">
          <header className="rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 text-white p-12 shadow-lg">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold">About Voyatra</h1>
              <p className="mt-4 text-lg text-white/90">
                Voyatra is a modern bus ticket booking platform built to make travel planning fast, safe, and convenient.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/search" className="btn-primary">Search Buses</Link>
                <Link href="/contact" className="btn-secondary">Contact Sales</Link>
              </div>
            </div>
          </header>

          <section className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card">
              <h3 className="text-lg font-semibold">Seamless Booking</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Find buses quickly with a clean search experience and live availability.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold">Real-Time Inventory</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Accurate seat and fare info with filters for AC/Non-AC and timings.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold">Secure Checkout</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Fast and secure payment flows with popular gateways.</p>
            </div>
          </section>

          <section className="mt-10 rounded-2xl bg-[var(--surface)] p-8">
            <h2 className="section-title">Our Mission</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">We believe travel should be effortless — Voyatra connects you to buses across the country with transparent pricing and friendly UX.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
