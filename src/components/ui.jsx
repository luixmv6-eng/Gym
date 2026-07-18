import { MUSCLE_GROUPS } from '../data/exercises'
import { useExerciseGif, isExerciseApiEnabled } from '../services/exerciseApi'
import { Dumbbell } from 'lucide-react'

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
  return (
    <div className="w-full rounded-full bg-bg-soft overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
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
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-3">
      {Icon && <Icon className="w-10 h-10 text-slate-600" />}
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="card w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-2xl animate-fade-up p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-lg uppercase mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
