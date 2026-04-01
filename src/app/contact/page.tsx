'use client'

import { useState } from 'react'
import Navbar from '@/components/common/Navbar'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill out all fields')
      return
    }
    setSubmitting(true)
    try {
      // simulate submit (replace with real API call)
      await new Promise((r) => setTimeout(r, 700))
      toast.success("Message sent — we'll reply within 24 hours")
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error('Unable to send message. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Toaster />
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-shell mx-auto max-w-4xl">
          <header className="rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 text-white p-10 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold">Get in touch</h1>
            <p className="mt-2 text-white/90">We're here to help — reach out for support, partnerships, or feedback.</p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="card">
              <h2 className="text-xl font-semibold">Contact Options</h2>
              <p className="mt-3 text-slate-600">Phone: <a href="tel:+919876543210" className="text-blue-600">+91 98765 43210</a></p>
              <p className="mt-1 text-slate-600">Email: <a href="mailto:support@voyatra.com" className="text-blue-600">support@voyatra.com</a></p>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">Office</h3>
                <p className="mt-1 text-slate-600">123 Main Street, Mumbai, Maharashtra, India</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold">Send us a message</h2>
              <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="contact-name" className="label">Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Your name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="you@example.com"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="label">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="input h-32"
                    placeholder="How can we help you?"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn-primary" type="submit" disabled={submitting} aria-busy={submitting}>
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                  <Link href="/" className="btn-secondary">Back Home</Link>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 text-sm text-slate-500">We aim to respond within 24 hours.</div>
        </div>
      </main>
    </div>
  )
}
