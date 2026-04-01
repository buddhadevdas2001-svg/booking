// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  const { to, subject, html, text } = await req.json()

  if (!to || !subject || (!html && !text)) {
    return new Response(JSON.stringify({ error: 'to, subject and html or text are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    
    body: JSON.stringify({
      from: 'Shamolly <bookings@shamolly.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  })

  const body = await response.text()
  return new Response(body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json'},
  })
})
