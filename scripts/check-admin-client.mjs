import fs from 'node:fs' 
import { createClient } from '@supabase/supabase-js' 
 
const envText = fs.readFileSync('.env.local', 'utf8') 
const env = {} 
for (const rawLine of envText.split(/\r?\n/)) { 
  const line = rawLine.trim() 
  if (!line || line.startsWith('#')) continue 
  const idx = line.indexOf('=') 
  if (idx === -1) continue 
  env[line.slice(0, idx)] = line.slice(idx + 1) 
} 
 
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { 
  auth: { autoRefreshToken: false, persistSession: false }, 
}) 
 
const checks = ['routes', 'buses', 'trips', 'staff', 'seat_layouts', 'offers', 'bookings', 'profiles'] 
for (const table of checks) { 
  const { data, error } = await supabase.from(table).select('id').limit(1) 
  if (error) { 
    console.log(table, 'ERROR', error.code, error.message) 
  } else { 
    console.log(table, 'OK', Array.isArray(data) ? data.length : 0) 
  } 
}
