import { buildCoachPrompt, offlineCoachReply } from '../data/content'

// ---- Proveedores de IA ----
// NVIDIA bloquea CORS desde el navegador, así que solo es usable a través del
// proxy (Supabase Edge Function en supabase/functions/ai-proxy). Mistral sí
// permite CORS directo. Router por complejidad:
//   simple   -> Mistral small (directo, ~1s)
//   compleja -> Llama 70B vía proxy si está configurado; si no, Mistral large
const MISTRAL_KEY = import.meta.env.VITE_MISTRAL_API_KEY
const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL // p.ej. https://<ref>.supabase.co/functions/v1/ai-proxy
const MODEL_OVERRIDE = import.meta.env.VITE_AI_MODEL // fuerza un modelo Mistral y desactiva el router

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MODEL_SIMPLE = 'mistral-small-latest'
const MODEL_COMPLEX_MISTRAL = 'mistral-large-latest'
const MODEL_COMPLEX_NVIDIA = 'meta/llama-3.1-70b-instruct'

export const aiEnabled = Boolean(MISTRAL_KEY || PROXY_URL)

// ---- Clasificador de complejidad (heurístico, sin coste ni latencia) ----
const PLANNING = [
  'diseña', 'diseñar', 'arma', 'armar', 'crea', 'crear', 'plan', 'planifica', 'programa',
  'rutina', 'periodiza', 'periodización', 'personaliza', 'personalizar', 'compara', 'comparación',
  'analiza', 'análisis', 'optimiza', 'optimizar', 'estrategia', 'progresión', 'adapta', 'ajusta',
]
const EXPLAIN = [
  'por qué', 'porqué', 'por que', 'explica', 'explícame', 'explicame', 'cómo', 'como ',
  'diferencia', 'ventajas', 'desventajas', 'paso a paso', 'detalla', 'detallad', 'cuál es mejor',
  'cual es mejor', 'debería', 'deberia', 'me recomiendas', 'recomiéndame', 'recomiendame',
]
const HEALTH = ['lesión', 'lesion', 'dolor', 'molestia', 'limitación', 'limitacion', 'rehabilit']

export function classify(message = '') {
  const t = message.toLowerCase()
  const wc = t.trim().split(/\s+/).filter(Boolean).length
  let score = 0
  if (PLANNING.some((k) => t.includes(k))) score += 2
  if (EXPLAIN.some((k) => t.includes(k))) score += 1
  if (HEALTH.some((k) => t.includes(k))) score += 1
  if (wc >= 15) score += 1
  if (wc >= 30) score += 1
  if ((message.match(/\?/g) || []).length >= 2 && wc >= 10) score += 1
  return score >= 2 ? 'complex' : 'simple'
}

// Texto plano, sin asteriscos ni markdown (preferencia del usuario)
function stripMarkdown(text) {
  return text
    .replace(/^\s*[*+-]\s+/gm, '- ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}/g, '')
    .replace(/#+\s/g, '')
    .replace(/\*/g, '')
    .trim()
}

async function callChat({ url, headers, model, system, messages, timeoutMs }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.95,
        messages: [
          { role: 'system', content: system },
          ...messages.slice(-10).map((m) => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        ],
      }),
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) throw new Error('respuesta vacía')
    return reply
  } finally {
    clearTimeout(timeout)
  }
}

// API principal. Analiza la pregunta y elige la ruta más eficiente.
export async function askCoach(messages, profile, metabolic, context = {}) {
  const last = messages[messages.length - 1]?.text || ''
  const kind = classify(last)

  if (!aiEnabled || !navigator.onLine) {
    await new Promise((r) => setTimeout(r, 300))
    return offlineCoachReply(last, profile)
  }

  const system =
    buildCoachPrompt(profile, metabolic, context) +
    '\nFORMATO: responde en texto plano, sin asteriscos ni markdown. Si enumeras, usa guiones (-).'

  // Cadena de intentos según complejidad y qué esté configurado
  const attempts = []
  if (kind === 'complex' && PROXY_URL && !MODEL_OVERRIDE) {
    attempts.push({ url: PROXY_URL, headers: {}, model: MODEL_COMPLEX_NVIDIA, timeoutMs: 26000 })
  }
  if (MISTRAL_KEY) {
    attempts.push({
      url: MISTRAL_URL,
      headers: { Authorization: `Bearer ${MISTRAL_KEY}` },
      model: MODEL_OVERRIDE || (kind === 'complex' ? MODEL_COMPLEX_MISTRAL : MODEL_SIMPLE),
      timeoutMs: 15000,
    })
  }

  for (const a of attempts) {
    try {
      const reply = await callChat({ ...a, system, messages })
      return stripMarkdown(reply)
    } catch (e) {
      console.warn('[coach]', a.model, '->', e.name === 'AbortError' ? 'timeout' : e.message)
    }
  }
  return offlineCoachReply(last, profile)
}
