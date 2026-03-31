'use client'

import Navbar from '@/components/common/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-shell space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <h1 className="text-4xl font-black text-slate-900">About Voyatra</h1>
            <p className="mt-4 text-lg text-slate-600">
              Voyatra is a modern bus ticket booking platform built to make travel planning fast, safe, and convenient.
              We integrate routes, routes, seat layout and checkout so you can compare price, timing and amenities at a glance.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-100 p-5">
                <h2 className="text-xl font-semibold text-slate-900">Seamless Booking</h2>
                <p className="mt-2 text-slate-500">
                  Find buses quickly with a clean search experience, configurable date filter and live availability.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-100 p-5">
                <h2 className="text-xl font-semibold text-slate-900">Real-Time Inventory</h2>
                <p className="mt-2 text-slate-500">
                  Get accurate seat and fare info from your backend, and apply filters for AC/Non-AC, timings and more.
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
