import { supabase, isSupabaseEnabled } from './supabaseClient'
import { useStore } from '../store/useStore'

// Claves del store que se sincronizan a la nube (no la sesión ni flags locales).
const SYNCED_KEYS = [
  'profile',
  'metabolic',
  'routine',
  'substitutions',
  'workoutLog',
  'dayNotes',
  'foodLog',
  'measurements',
  'photos',
  'activeSupplements',
  'chat',
  'settings',
]

function snapshot(state) {
  const out = {}
  SYNCED_KEYS.forEach((k) => (out[k] = state[k]))
  return out
}

// Descarga el estado del usuario y lo fusiona (la nube gana si es más reciente).
export async function pullState(userId) {
  if (!isSupabaseEnabled || !userId) return
  const { data, error } = await supabase
    .from('user_state')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.state) return
  const cloud = data.state
  const local = useStore.getState()

  // Heurística: si la nube tiene perfil y el local no, o la nube tiene más sesiones, hidrata.
  const cloudScore = (cloud.workoutLog?.length || 0) + (cloud.profile ? 1 : 0)
  const localScore = (local.workoutLog?.length || 0) + (local.profile ? 1 : 0)
  if (cloudScore >= localScore) {
    useStore.setState(cloud)
  }
}

let timer = null
let lastPushed = ''
let lastProfile = ''

// Sincroniza los campos del perfil a la tabla relacional public.profiles,
// para que los usuarios queden guardados de forma consultable (no solo como
// blob JSON en user_state). Best-effort: si falla, la app sigue funcionando.
export async function pushProfile(userId, email) {
  if (!isSupabaseEnabled || !userId || userId === 'local') return
  const p = useStore.getState().profile
  if (!p) return
  const row = {
    id: userId,
    email: email || null,
    name: p.name ?? null,
    age: p.age ?? null,
    sex: p.sex ?? null,
    weight: p.weight ?? null,
    height: p.height ?? null,
    goal: p.goal ?? null,
    experience: p.experience ?? null,
    days_per_week: p.daysPerWeek ?? null,
    injuries: p.injuries ?? null,
  }
  const serialized = JSON.stringify(row)
  if (serialized === lastProfile) return
  lastProfile = serialized
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
  if (error) console.warn('[sync] perfil no guardado (se conserva local):', error.message)
}

// Empuja el estado a la nube (con debounce). Best-effort: si falla, sigue local.
export async function pushState(userId) {
  if (!isSupabaseEnabled || !userId || userId === 'local') return
  const snap = snapshot(useStore.getState())
  const serialized = JSON.stringify(snap)
  if (serialized === lastPushed) return
  lastPushed = serialized
  const { error } = await supabase
    .from('user_state')
    .upsert(
      { user_id: userId, state: snap, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) console.warn('[sync] push falló (se conserva local):', error.message)
}

let unsub = null
// Arranca la sincronización automática para un usuario.
export function startSync(userId, email) {
  stopSync()
  if (!isSupabaseEnabled || !userId || userId === 'local') return
  // Empuje inicial del perfil (por si ya hay onboarding hecho al iniciar sesión).
  pushProfile(userId, email)
  unsub = useStore.subscribe(() => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      pushState(userId)
      pushProfile(userId, email)
    }, 1500)
  })
}

export function stopSync() {
  if (unsub) unsub()
  unsub = null
  clearTimeout(timer)
  lastPushed = ''
  lastProfile = ''
}
