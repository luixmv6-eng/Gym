import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { signIn, signUp, signInWithGoogle, resetPassword } from '../services/auth'
import { isSupabaseEnabled } from '../services/supabaseClient'
import { Mail, Lock, Zap, Loader2 } from 'lucide-react'

export default function Login() {
  const login = useStore((s) => s.login)
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setInfo('')
    if (!email.includes('@')) return setErr('Introduce un email válido')
    if (pass.length < (isSupabaseEnabled ? 6 : 4))
      return setErr(`La contraseña debe tener al menos ${isSupabaseEnabled ? 6 : 4} caracteres`)

    setBusy(true)
    const fn = mode === 'login' ? signIn : signUp
    const { user, error, needsConfirmation } = await fn(email, pass)
    setBusy(false)

    if (error) return setErr(error)
    if (needsConfirmation) {
      return setInfo('Te enviamos un email de confirmación. Revísalo para activar tu cuenta.')
    }
    if (user) {
      login(user)
      nav('/')
    }
  }

  const google = async () => {
    setErr('')
    setBusy(true)
    const { error } = await signInWithGoogle()
    setBusy(false)
    if (error) setErr(error) // si es exitoso, redirige y App capta la sesión
  }

  const forgot = async () => {
    setErr('')
    setInfo('')
    if (!email.includes('@')) return setErr('Escribe tu email arriba primero')
    const { error } = await resetPassword(email)
    if (error) setErr(error)
    else setInfo('Te enviamos un enlace para restablecer tu contraseña.')
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center mb-8 animate-fade-up">
        <div className="w-20 h-20 rounded-3xl bg-bg-soft border border-line flex items-center justify-center mb-4">
          <img src="/icons/icon.svg" alt="Gym Companion" className="w-14 h-14" />
        </div>
        <h1 className="text-4xl uppercase text-slate-100">Gym Companion</h1>
        <p className="text-muted mt-2">Tu coach personal de bolsillo. Rutinas, nutrición y progreso.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4 animate-fade-up">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="email" type="email" autoComplete="email" className="input pl-11"
              placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="pass">Contraseña</label>
            {mode === 'login' && isSupabaseEnabled && (
              <button type="button" onClick={forgot} className="text-xs text-primary mb-1.5">
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="pass" type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="input pl-11" placeholder="••••••••" value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
        </div>

        {err && <p role="alert" className="text-sm text-red-400 -mt-1">{err}</p>}
        {info && <p role="status" className="text-sm text-accent -mt-1">{info}</p>}

        <button type="submit" className="btn-primary mt-2" disabled={busy}>
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      {isSupabaseEnabled && (
        <>
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted">o</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <button className="btn-ghost" onClick={google} disabled={busy}>
            <GoogleIcon /> Continuar con Google
          </button>
        </>
      )}

      <p className="text-center text-sm text-muted mt-6">
        {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
        <button
          className="text-primary font-semibold"
          onClick={() => { setErr(''); setInfo(''); setMode(mode === 'login' ? 'register' : 'login') }}
        >
          {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </p>

      <p className="text-center text-xs text-slate-600 mt-8">
        {isSupabaseEnabled
          ? 'Tu progreso se sincroniza en la nube y funciona sin conexión.'
          : 'Modo local: tus datos se guardan en este dispositivo. Añade Supabase para sincronizar en la nube.'}
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.4 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}
