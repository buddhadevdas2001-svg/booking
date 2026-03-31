// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  const { to, message } = await req.json()
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!to || !message) {
    return new Response(JSON.stringify({ error: 'to and message are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!accountSid || !authToken || !from) {
    return new Response(JSON.stringify({ error: 'Missing Twilio secrets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: message,
  })

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const responseBody = await response.text()

  return new Response(
    responseBody,
    {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
})
