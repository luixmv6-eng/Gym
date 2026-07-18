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
export function startSync(userId) {
  stopSync()
  if (!isSupabaseEnabled || !userId || userId === 'local') return
  unsub = useStore.subscribe(() => {
    clearTimeout(timer)
    timer = setTimeout(() => pushState(userId), 1500)
  })
}

export function stopSync() {
  if (unsub) unsub()
  unsub = null
  clearTimeout(timer)
  lastPushed = ''
}
