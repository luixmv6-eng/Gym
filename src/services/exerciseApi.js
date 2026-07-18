import { useEffect, useState } from 'react'

// Términos de búsqueda en inglés para ExerciseDB (nuestros ejercicios están en español).
const SEARCH_TERMS = {
  // Pecho
  'bench-press': 'barbell bench press',
  'incline-bb-press': 'barbell incline bench press',
  'incline-db-press': 'dumbbell incline bench press',
  'flat-db-press': 'dumbbell bench press',
  'cable-fly': 'cable middle fly',
  'pec-deck': 'lever pec deck fly',
  pushups: 'push up',
  'machine-press': 'lever chest press',
  'dips-chest': 'chest dip',
  // Espalda
  deadlift: 'barbell deadlift',
  'barbell-row': 'barbell bent over row',
  'pendlay-row': 'barbell bent over row',
  'lat-pulldown': 'cable pulldown',
  pullups: 'pull up',
  'seated-row': 'cable seated row',
  'db-row': 'dumbbell bent over row',
  'tbar-row': 'lever t-bar row',
  'straight-arm-pulldown': 'cable straight arm pulldown',
  'face-pull': 'cable standing rear delt row',
  // Piernas
  squat: 'barbell full squat',
  'front-squat': 'barbell front squat',
  'hack-squat': 'sled hack squat',
  'leg-press': 'leg press',
  'romanian-deadlift': 'barbell romanian deadlift',
  'bulgarian-split': 'dumbbell single leg split squat',
  'walking-lunge': 'dumbbell lunge',
  'leg-curl': 'lever lying leg curl',
  'seated-leg-curl': 'lever seated leg curl',
  'leg-extension': 'lever leg extension',
  'calf-raise': 'lever standing calf raise',
  'seated-calf': 'lever seated calf raise',
  'hip-thrust': 'barbell hip thrust',
  'goblet-squat': 'dumbbell goblet squat',
  // Hombros
  ohp: 'barbell seated overhead press',
  'db-shoulder-press': 'dumbbell seated shoulder press',
  'arnold-press': 'dumbbell arnold press',
  'lateral-raise': 'dumbbell lateral raise',
  'cable-lateral': 'cable lateral raise',
  'rear-delt-fly': 'dumbbell rear lateral raise',
  'front-raise': 'dumbbell front raise',
  'upright-row': 'barbell upright row',
  // Brazos
  'barbell-curl': 'barbell curl',
  'dumbbell-curl': 'dumbbell biceps curl',
  'hammer-curl': 'dumbbell hammer curl',
  'preacher-curl': 'barbell preacher curl',
  'cable-curl': 'cable curl',
  'triceps-pushdown': 'cable pushdown',
  'rope-pushdown': 'cable rope pushdown',
  skullcrusher: 'barbell lying triceps extension',
  'overhead-triceps': 'dumbbell one arm triceps extension',
  dips: 'triceps dips',
  // Core
  plank: 'front plank',
  'hanging-leg-raise': 'hanging leg raise',
  'cable-crunch': 'cable kneeling crunch',
  'russian-twist': 'russian twist',
  'ab-wheel': 'wheel rollout',
  'leg-raise': 'lying leg raise',
  'mountain-climber': 'mountain climber',
  // Cardio
  treadmill: 'run',
  'incline-walk': 'walk elliptical cross trainer',
  rowing: 'rowing machine',
  cycling: 'stationary bike walk',
  stairmaster: 'stair climber',
}

const KEY = import.meta.env.VITE_RAPIDAPI_KEY
export const isExerciseApiEnabled = Boolean(KEY)

const HOST = 'exercisedb.p.rapidapi.com'
const HEADERS = { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST }
const CACHE_PREFIX = 'exdb-gif-'
const memory = new Map()

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

// Devuelve un data URL del GIF (o null). Flujo: nombre -> id -> /image (binario) -> dataURL.
// Cachea el resultado en memoria y localStorage para no re-consumir cuota ni conexión.
export async function fetchGif(exerciseId) {
  if (!KEY) return null
  if (memory.has(exerciseId)) return memory.get(exerciseId)

  const cached = localStorage.getItem(CACHE_PREFIX + exerciseId)
  if (cached) {
    memory.set(exerciseId, cached)
    return cached
  }

  const term = SEARCH_TERMS[exerciseId]
  if (!term) return null

  try {
    // 1) Buscar el ejercicio para obtener su id de ExerciseDB
    const searchRes = await fetch(
      `https://${HOST}/exercises/name/${encodeURIComponent(term)}?limit=1`,
      { headers: HEADERS }
    )
    if (!searchRes.ok) throw new Error('search ' + searchRes.status)
    const list = await searchRes.json()
    const edbId = list?.[0]?.id
    if (!edbId) return null

    // 2) Obtener el GIF (binario) y convertirlo a data URL usable en <img>
    const imgRes = await fetch(
      `https://${HOST}/image?exerciseId=${edbId}&resolution=180`,
      { headers: HEADERS }
    )
    if (!imgRes.ok) throw new Error('image ' + imgRes.status)
    const blob = await imgRes.blob()
    if (!blob.type.startsWith('image/')) throw new Error('no es imagen')
    const dataUrl = await blobToDataURL(blob)

    memory.set(exerciseId, dataUrl)
    try {
      localStorage.setItem(CACHE_PREFIX + exerciseId, dataUrl)
    } catch {
      // localStorage lleno: seguimos con caché en memoria
    }
    return dataUrl
  } catch (e) {
    console.warn('[exerciseApi]', e.message)
    return null
  }
}

// Hook para usar el GIF en componentes.
export function useExerciseGif(exerciseId) {
  const [gif, setGif] = useState(() => memory.get(exerciseId) || null)
  const [loading, setLoading] = useState(isExerciseApiEnabled && !gif)

  useEffect(() => {
    if (!isExerciseApiEnabled) return
    let active = true
    if (memory.get(exerciseId)) {
      setGif(memory.get(exerciseId))
      setLoading(false)
      return
    }
    setLoading(true)
    fetchGif(exerciseId).then((url) => {
      if (active) {
        setGif(url)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [exerciseId])

  return { gif, loading }
}
