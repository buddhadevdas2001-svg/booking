'use client'

import Navbar from '@/components/common/Navbar'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-shell mx-auto max-w-4xl">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <h1 className="text-4xl font-black text-slate-900">Contact Us</h1>
            <p className="mt-4 text-lg text-slate-600">
              Have a question about your booking? Need help with customer service? Reach us via phone or email below.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 p-5">
                <h2 className="text-xl font-semibold text-slate-900">Support</h2>
                <p className="mt-2 text-slate-500">support@voyatra.com</p>
                <p className="mt-1 text-slate-500">+91 98765 43210</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-5">
                <h2 className="text-xl font-semibold text-slate-900">Address</h2>
                <p className="mt-2 text-slate-500">123 Main Street, Mumbai, Maharashtra, India</p>
              </div>
            </div>

            <form className="mt-10 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-blue-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-blue-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Message</label>
                <textarea
                  required
                  className="mt-1 h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 focus:border-blue-500 focus:outline-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#f5b433] px-6 py-3 font-bold text-slate-900 transition hover:bg-[#efaa1f]"
              >
                Send Message
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
