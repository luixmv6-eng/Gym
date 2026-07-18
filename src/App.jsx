import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'
import { isSupabaseEnabled, keepAlivePing } from './services/supabaseClient'
import { getCurrentUser, onAuthChange } from './services/auth'
import { startSync, stopSync, pullState } from './services/sync'
import Layout from './components/Layout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Routines from './pages/Routines'
import LiveWorkout from './pages/LiveWorkout'
import Calendar from './pages/Calendar'
import Nutrition from './pages/Nutrition'
import Supplements from './pages/Supplements'
import Coach from './pages/Coach'
import Profile from './pages/Profile'
import Tips from './pages/Tips'

// Progreso carga Recharts (pesado) -> code-splitting
const Progress = lazy(() => import('./pages/Progress'))

function Loading() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-line border-t-primary animate-spin" />
    </div>
  )
}

function Protected({ children }) {
  const session = useStore((s) => s.session)
  const profile = useStore((s) => s.profile)
  const loc = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: loc }} />
  if (!profile && loc.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  const session = useStore((s) => s.session)
  const login = useStore((s) => s.login)
  const logout = useStore((s) => s.logout)
  const ensureWeeklyRotation = useStore((s) => s.ensureWeeklyRotation)

  // Rotación semanal de ejercicios: al abrir la app y al volver a ella,
  // si empezó una semana nueva (lunes) la rutina rota automáticamente.
  // El ping mantiene activa la base de datos (evita la pausa del plan gratuito).
  useEffect(() => {
    ensureWeeklyRotation()
    keepAlivePing()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        ensureWeeklyRotation()
        keepAlivePing()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, []) // eslint-disable-line

  // Bootstrap de sesión + sincronización con la nube (si Supabase está configurado)
  useEffect(() => {
    if (!isSupabaseEnabled) return
    let active = true

    getCurrentUser().then(async (user) => {
      if (!active) return
      if (user) {
        login(user)
        await pullState(user.id)
        ensureWeeklyRotation() // la nube puede traer una rutina de semanas anteriores
        startSync(user.id, user.email)
      }
    })

    const unsub = onAuthChange(async (user, event) => {
      if (user) {
        login(user)
        await pullState(user.id)
        ensureWeeklyRotation() // la nube puede traer una rutina de semanas anteriores
        startSync(user.id, user.email)
      } else if (event === 'SIGNED_OUT') {
        // Solo cerramos sesión ante un cierre EXPLÍCITO de Supabase,
        // no al inicializar sin sesión (así no expulsamos una sesión local).
        stopSync()
        logout()
      }
    })

    return () => {
      active = false
      unsub()
      stopSync()
    }
  }, []) // eslint-disable-line

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />
      {/* Modo entrenamiento a pantalla completa (sin nav) */}
      <Route
        path="/workout"
        element={
          <Protected>
            <LiveWorkout />
          </Protected>
        }
      />

      {/* Rutas con layout */}
      {[
        ['/', Dashboard],
        ['/routines', Routines],
        ['/calendar', Calendar],
        ['/nutrition', Nutrition],
        ['/supplements', Supplements],
        ['/coach', Coach],
        ['/progress', Progress],
        ['/profile', Profile],
        ['/tips', Tips],
      ].map(([path, Comp]) => (
        <Route
          key={path}
          path={path}
          element={
            <Protected>
              <Layout>
                <Suspense fallback={<Loading />}>
                  <Comp />
                </Suspense>
              </Layout>
            </Protected>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
