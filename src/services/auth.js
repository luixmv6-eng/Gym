import { supabase, isSupabaseEnabled } from './supabaseClient'

// Capa de autenticación. Usa Supabase si está configurado; si no, modo local.
// Todas las funciones devuelven { user, error } de forma homogénea.

export async function signUp(email, password) {
  if (!isSupabaseEnabled) return localAuth(email)
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { user: null, error: mapError(error) }
  return { user: normalize(data.user), error: null, needsConfirmation: !data.session }
}

export async function signIn(email, password) {
  if (!isSupabaseEnabled) return localAuth(email)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: mapError(error) }
  return { user: normalize(data.user), error: null }
}

export async function signInWithGoogle() {
  if (!isSupabaseEnabled)
    return { user: null, error: 'Google Sign-In requiere configurar Supabase.' }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'select_account', // deja elegir cuenta en vez de entrar con la última usada
      },
    },
  })
  return { user: null, error: error ? mapError(error) : null } // redirige
}

export async function resetPassword(email) {
  if (!isSupabaseEnabled)
    return { error: 'La recuperación por email requiere Supabase configurado.' }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  })
  return { error: error ? mapError(error) : null }
}

export async function signOut() {
  if (isSupabaseEnabled) await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (!isSupabaseEnabled) return null
  const { data } = await supabase.auth.getUser()
  return data?.user ? normalize(data.user) : null
}

// Escucha cambios de sesión (OAuth redirect, refresh, logout).
// Pasa también el evento para distinguir un cierre de sesión real de un inicio sin sesión.
export function onAuthChange(callback) {
  if (!isSupabaseEnabled) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ? normalize(session.user) : null, event)
  })
  return () => data.subscription.unsubscribe()
}

// --- helpers ---
function localAuth(email) {
  return { user: { id: 'local', email }, error: null }
}
function normalize(user) {
  return { id: user.id, email: user.email }
}
function mapError(error) {
  const m = error.message || ''
  if (m.includes('Invalid login')) return 'Email o contraseña incorrectos.'
  if (m.includes('already registered')) return 'Ese email ya está registrado.'
  if (m.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('provider is not enabled') || m.includes('Unsupported provider'))
    return 'El inicio de sesión con Google no está habilitado todavía en Supabase (Authentication → Sign In / Providers).'
  return m || 'Error de autenticación.'
}
