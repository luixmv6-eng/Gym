import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// La app funciona sin Supabase (modo local). Solo se crea el cliente si hay claves.
export const isSupabaseEnabled = Boolean(url && anonKey)

export const supabase = isSupabaseEnabled
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Ping ligero a la API de Supabase al abrir la app (máx. 1 vez al día por
// dispositivo). Junto con el cron de Vercel (api/keepalive.js) mantiene el
// proyecto activo para que el plan gratuito no lo pause por inactividad.
const PING_KEY = 'gc-db-ping-at'
export function keepAlivePing() {
  if (!isSupabaseEnabled || !navigator.onLine) return
  try {
    const last = Number(localStorage.getItem(PING_KEY)) || 0
    if (Date.now() - last < 20 * 60 * 60 * 1000) return
    localStorage.setItem(PING_KEY, String(Date.now()))
    fetch(`${url}/rest/v1/user_state?select=user_id&limit=1`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    }).catch(() => {})
  } catch {
    /* best-effort */
  }
}
