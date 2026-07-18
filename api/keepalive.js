// Ping de mantenimiento a Supabase. Vercel lo ejecuta a diario (ver "crons" en
// vercel.json) para generar actividad en la API y evitar que el proyecto del
// plan gratuito se pause por inactividad (~7 días sin llamadas).
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY' })
  }
  try {
    const r = await fetch(`${url}/rest/v1/user_state?select=user_id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    return res.status(200).json({ ok: r.ok, status: r.status, at: new Date().toISOString() })
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) })
  }
}
