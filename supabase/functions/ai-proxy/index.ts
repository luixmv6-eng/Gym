// Supabase Edge Function: proxy hacia NVIDIA NIM (que bloquea CORS desde navegadores).
// La clave vive como secreto del servidor (NVIDIA_API_KEY), nunca llega al frontend.
//
// Desplegar (desde la raíz del proyecto):
//   npx supabase login
//   npx supabase link --project-ref <tu-ref>
//   npx supabase secrets set NVIDIA_API_KEY=nvapi-...
//   npx supabase functions deploy ai-proxy --no-verify-jwt
//
// URL resultante: https://<tu-ref>.supabase.co/functions/v1/ai-proxy
// Pégala en .env como VITE_AI_PROXY_URL y reinicia el dev server.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const key = Deno.env.get('NVIDIA_API_KEY')
  if (!key) {
    return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY no configurada en secrets' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    // Solo permitimos los campos del chat (evita abuso del proxy para otros fines)
    const safe = {
      model: String(body.model || 'meta/llama-3.1-70b-instruct'),
      max_tokens: Math.min(Number(body.max_tokens) || 1024, 2048),
      temperature: Number(body.temperature ?? 0.7),
      top_p: Number(body.top_p ?? 0.95),
      messages: Array.isArray(body.messages) ? body.messages.slice(-20) : [],
    }

    const upstream = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(safe),
    })

    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
