import { Link } from 'react-router-dom'
import { useStore, todayStr } from '../store/useStore'
import { Card, ProgressBar, GroupBadge, AnimatedNumber, ProgressRing, buzz } from '../components/ui'
import { tipOfDay } from '../data/content'
import { Play, Flame, TrendingUp, Lightbulb, ChevronRight, Trophy, Clock, Droplets, Plus, Minus } from 'lucide-react'

function computeStreak(log) {
  if (!log.length) return 0
  const days = new Set(log.map((w) => w.date))
  let streak = 0
  const d = new Date()
  // permite que hoy aún no esté hecho
  if (!days.has(todayStr(d))) d.setDate(d.getDate() - 1)
  while (days.has(todayStr(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function Dashboard() {
  const { profile, metabolic, routine, workoutLog, foodLog, dayNotes, setDayNote } = useStore()
  const today = todayStr()
  const dow = (new Date().getDay() + 6) % 7 // Lunes=0
  const todayPlan = routine?.week?.[dow]

  const eaten = (foodLog[today] || []).reduce(
    (a, f) => ({ p: a.p + f.p, c: a.c + f.c, f: a.f + f.f, kcal: a.kcal + f.kcal }),
    { p: 0, c: 0, f: 0, kcal: 0 }
  )
  const streak = computeStreak(workoutLog)
  const doneToday = workoutLog.some((w) => w.date === today)

  const first = profile?.name?.split(' ')[0] || 'Atleta'
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="flex flex-col gap-5 stagger">
      <div>
        <p className="text-muted">{greet},</p>
        <h1 className="text-4xl uppercase leading-none">
          <span className="text-ember">{first}</span>
        </h1>
      </div>

      {/* Entrenamiento de hoy */}
      <Card className="relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)' }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted">Hoy · {todayPlan?.day}</span>
            <h2 className="text-3xl uppercase mt-1 leading-none">{todayPlan?.title || 'Descanso'}</h2>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {todayPlan?.groups?.map((g) => (
                <GroupBadge key={g} group={g} />
              ))}
            </div>
            {!todayPlan?.rest && (
              <div className="text-sm text-muted tabular flex items-center gap-3 mt-2.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> ~{todayPlan.estimatedMin} min
                </span>
                <span>{todayPlan.exercises.length} ejercicios</span>
              </div>
            )}
          </div>
          {doneToday && <span className="chip bg-accent/15 text-accent border-accent/30 shrink-0">Hecho ✓</span>}
        </div>
        {!todayPlan?.rest && (
          <Link to="/workout" className="btn-primary btn-shine w-full mt-4">
            <Play className="w-5 h-5" /> {doneToday ? 'Repetir sesión' : 'Iniciar entrenamiento'}
          </Link>
        )}
        {todayPlan?.rest && (
          <p className="text-sm text-muted mt-3 relative">Día de descanso. Recupera, hidrátate y duerme bien.</p>
        )}
      </Card>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-3">
        <StatMini icon={Flame} label="Racha" value={streak} unit="días" color="#F97316" pulse={streak > 0} />
        <StatMini icon={Trophy} label="Sesiones" value={workoutLog.length} unit="total" color="#22C55E" />
        <StatMini icon={TrendingUp} label="Objetivo" value={metabolic?.calories} unit="kcal" color="#3B82F6" />
      </div>

      {/* Macros de hoy: anillo calórico + barras */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="uppercase text-lg accent-bar">Macros de hoy</h3>
          <Link to="/nutrition" className="text-sm text-primary flex items-center">
            Registrar <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <ProgressRing value={eaten.kcal} max={metabolic?.calories} color="#F97316">
            <AnimatedNumber
              value={Math.max(0, (metabolic?.calories || 0) - eaten.kcal)}
              className="font-display text-2xl leading-none text-slate-100"
            />
            <span className="text-[10px] uppercase tracking-wide text-muted mt-0.5">
              kcal libres
            </span>
          </ProgressRing>
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <Macro label="Proteína" value={eaten.p} max={metabolic?.macros.protein} unit="g" color="#22C55E" />
            <Macro label="Carbos" value={eaten.c} max={metabolic?.macros.carbs} unit="g" color="#3B82F6" />
            <Macro label="Grasas" value={eaten.f} max={metabolic?.macros.fat} unit="g" color="#EAB308" />
          </div>
        </div>
      </Card>

      {/* Hidratación */}
      <WaterCard
        liters={dayNotes[today]?.water ?? 0}
        goal={Math.round((profile?.weight || 70) * 0.035 * 2) / 2}
        onChange={(v) => setDayNote(today, { water: v })}
      />

      {/* Tip del día */}
      <Card className="flex gap-3 items-start bg-bg-soft">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase text-muted">Tip del día</p>
          <p className="text-sm text-slate-200 mt-0.5">{tipOfDay()}</p>
        </div>
      </Card>
    </div>
  )
}

function StatMini({ icon: Icon, label, value, unit, color, pulse = false }) {
  return (
    <Card className="p-3 flex flex-col gap-1 items-start hover-lift">
      <Icon className={`w-4 h-4 ${pulse ? 'animate-float' : ''}`} style={{ color }} />
      <span className="font-display text-2xl leading-none mt-1" style={{ color }}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value ?? '—'}
      </span>
      <span className="text-[11px] text-muted">{label} · {unit}</span>
    </Card>
  )
}

function WaterCard({ liters, goal, onChange }) {
  return (
    <Card className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
        <Droplets className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">Agua de hoy</span>
          <span className="tabular text-muted">
            {liters}L / {goal}L
          </span>
        </div>
        <ProgressBar value={liters} max={goal} color="#60A5FA" />
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          className="btn-ghost px-0 w-10 h-10"
          onClick={() => {
            buzz()
            onChange(Math.max(0, +(liters - 0.25).toFixed(2)))
          }}
          aria-label="Menos agua"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          className="btn-ghost px-0 w-10 h-10"
          onClick={() => {
            buzz()
            onChange(+(liters + 0.25).toFixed(2))
          }}
          aria-label="Más agua"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}

function Macro({ label, value, max, unit, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="tabular text-muted">
          {Math.round(value)}/{max ?? '—'} {unit}
        </span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
    </div>
  )
}
