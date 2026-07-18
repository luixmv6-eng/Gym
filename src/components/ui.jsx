import { useEffect, useRef, useState } from 'react'
import { MUSCLE_GROUPS } from '../data/exercises'
import { useExerciseGif, isExerciseApiEnabled } from '../services/exerciseApi'
import { Dumbbell, X } from 'lucide-react'

// Vibración háptica breve para confirmar acciones (silencioso donde no hay soporte).
export function buzz(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* sin soporte */
  }
}

// Anillo de progreso SVG con relleno animado y glow del color.
export function ProgressRing({ value = 0, max = 1, size = 108, stroke = 9, color = '#F97316', children }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const [offset, setOffset] = useState(c)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOffset(c * (1 - pct)))
    return () => cancelAnimationFrame(raf)
  }, [pct, c])

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)',
            filter: `drop-shadow(0 0 6px ${color}59)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

// Número que cuenta desde su valor anterior hasta el nuevo (respeta prefers-reduced-motion).
export function AnimatedNumber({ value, decimals = 0, duration = 650, className = '', ...props }) {
  const target = Number(value) || 0
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const from = prev.current
    prev.current = target
    if (from === target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target)
      return
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (target - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return (
    <span className={`tabular ${className}`} {...props}>
      {display.toFixed(decimals)}
    </span>
  )
}

// Muestra el GIF del ejercicio (ExerciseDB) o un placeholder acorde al grupo muscular.
export function ExerciseMedia({ exercise, className = '' }) {
  const { gif, loading } = useExerciseGif(exercise?.id)
  const color = MUSCLE_GROUPS[exercise?.group]?.color || '#F97316'

  if (gif) {
    return (
      <img
        src={gif}
        alt={`Demostración: ${exercise?.name}`}
        loading="lazy"
        className={`w-full aspect-square object-contain rounded-xl bg-white ${className}`}
      />
    )
  }
  return (
    <div
      className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-2 ${className}`}
      style={{ background: `${color}1A`, border: `1px solid ${color}40` }}
    >
      {loading ? (
        <div className="w-7 h-7 rounded-full border-2 border-line border-t-primary animate-spin" />
      ) : (
        <>
          <Dumbbell className="w-10 h-10" style={{ color }} />
          {!isExerciseApiEnabled && (
            <span className="text-[11px] text-muted px-4 text-center">
              Añade tu clave de ExerciseDB para ver la animación
            </span>
          )}
        </>
      )}
    </div>
  )
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`card p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl uppercase text-slate-100">{children}</h2>
      {right}
    </div>
  )
}

export function Stat({ label, value, unit, color = '#F97316' }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="text-2xl font-display tabular" style={{ color }}>
        {value}
        {unit && <span className="text-sm text-muted ml-1 font-sans">{unit}</span>}
      </span>
    </div>
  )
}

export function ProgressBar({ value, max, color = '#F97316', height = 8 }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0)
  // Arranca en 0 y se rellena en el primer render para que la barra "crezca" al entrar
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(raf)
  }, [pct])

  return (
    <div className="w-full rounded-full bg-bg-soft overflow-hidden" style={{ height }}>
      <div
        className="relative h-full rounded-full overflow-hidden transition-all duration-700 ease-out"
        style={{
          width: `${width}%`,
          background: color,
          boxShadow: pct > 0 ? `0 0 12px -2px ${color}99` : 'none',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 2.5s infinite',
          }}
        />
      </div>
    </div>
  )
}

export function GroupBadge({ group }) {
  const g = MUSCLE_GROUPS[group] || MUSCLE_GROUPS.descanso
  return (
    <span
      className="chip border-transparent text-slate-900"
      style={{ background: g.color, cursor: 'default' }}
    >
      {g.label}
    </span>
  )
}

export function Empty({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-3 animate-fade-up">
      {Icon && <Icon className="w-10 h-10 text-slate-600 animate-float" />}
      <p className="text-slate-300 font-medium">{title}</p>
      {hint && <p className="text-sm text-muted max-w-xs">{hint}</p>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-2xl animate-slide-up sm:animate-scale-in p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Asa de bottom-sheet (solo móvil) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-line mx-auto -mt-1 mb-3" />
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full text-slate-400 bg-bg-soft/80 hover:bg-line/60 hover:text-slate-100 transition-colors active:scale-90"
        >
          <X className="w-[18px] h-[18px]" />
        </button>
        {title && <h3 className="text-lg uppercase mb-3 pr-10">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
