import { useState } from 'react'
import { useStore, todayStr } from '../store/useStore'
import { MUSCLE_GROUPS, getExercise } from '../data/exercises'
import { Card, Modal, GroupBadge } from '../components/ui'
import { ChevronLeft, ChevronRight, Check, Clock, CalendarDays, Dumbbell } from 'lucide-react'

const WD = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function Calendar() {
  const { routine, workoutLog, dayNotes, setDayNote, substitutions } = useStore()
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const done = new Set(workoutLog.map((w) => w.date))

  const planForDate = (d) => routine?.week?.[(new Date(year, month, d).getDay() + 6) % 7]

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthName = cursor.toLocaleDateString('es', { month: 'long', year: 'numeric' })

  // Resumen semanal (según la rutina)
  const trainingDays = routine?.week?.filter((d) => !d.rest) || []
  const weeklyMin = trainingDays.reduce((a, d) => a + (d.estimatedMin || 0), 0)

  return (
    <div className="flex flex-col gap-4 stagger">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl uppercase capitalize accent-bar">{monthName}</h1>
        <div className="flex gap-1">
          <button className="btn-ghost px-3" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Mes anterior">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="btn-ghost px-3" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Mes siguiente">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Resumen del plan semanal */}
      <div className="grid grid-cols-3 gap-3">
        <SumStat icon={CalendarDays} value={trainingDays.length} label="días/semana" />
        <SumStat icon={Clock} value={`${Math.round((weeklyMin / 60) * 10) / 10}h`} label="tiempo semanal" />
        <SumStat icon={Dumbbell} value={`${Math.round(weeklyMin / (trainingDays.length || 1))}′`} label="por sesión" />
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WD.map((w) => (
            <div key={w} className="text-center text-xs text-muted py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const dateStr = todayStr(new Date(year, month, d))
            const plan = planForDate(d)
            const color = MUSCLE_GROUPS[plan?.groups?.[0]]?.color
            const isToday = dateStr === todayStr()
            const isDone = done.has(dateStr)
            return (
              <button
                key={i}
                onClick={() => setSelected({ d, dateStr, plan })}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isToday ? 'ring-2 ring-primary' : ''
                }`}
                style={{ background: plan?.rest ? 'rgba(255,255,255,0.03)' : `${color}22` }}
              >
                <span className={`text-sm tabular ${isToday ? 'text-primary font-bold' : 'text-slate-200'}`}>{d}</span>
                {!plan?.rest && (
                  <span className="text-[8px] leading-none text-muted tabular mt-0.5">{plan?.estimatedMin}′</span>
                )}
                {isDone && <Check className="w-3 h-3 text-accent absolute top-1 right-1" strokeWidth={3} />}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {Object.entries(MUSCLE_GROUPS).map(([k, g]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
            {g.label}
          </span>
        ))}
      </div>

      <DayModal
        selected={selected}
        onClose={() => setSelected(null)}
        note={selected ? dayNotes[selected.dateStr] : null}
        onSave={(patch) => setDayNote(selected.dateStr, patch)}
        isDone={selected && done.has(selected.dateStr)}
        resolve={(id) => substitutions[id] || id}
      />
    </div>
  )
}

function SumStat({ icon: Icon, value, label }) {
  return (
    <Card className="p-3 flex flex-col gap-1 items-start">
      <Icon className="w-4 h-4 text-primary" />
      <span className="font-display text-xl text-slate-100 tabular leading-none mt-1">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </Card>
  )
}

function DayModal({ selected, onClose, note, onSave, isDone, resolve }) {
  const [local, setLocal] = useState({})
  if (!selected) return null
  const val = { energy: 5, soreness: 3, water: 2, sleptWell: true, note: '', ...note, ...local }
  const up = (patch) => setLocal((s) => ({ ...s, ...patch }))
  const plan = selected.plan

  return (
    <Modal open={!!selected} onClose={onClose} title={`${selected.plan?.day || ''} ${selected.d}`}>
      <div className="flex flex-col gap-4">
        {/* Plan del día */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-wrap gap-2">
              {plan?.groups?.map((g) => (
                <GroupBadge key={g} group={g} />
              ))}
            </div>
            {isDone && <span className="chip bg-accent/15 text-accent border-accent/30">Hecho ✓</span>}
          </div>
          {!plan?.rest ? (
            <div className="card p-3 bg-bg-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-lg uppercase">{plan.title}</span>
                <span className="text-xs text-muted tabular flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{plan.estimatedMin} min
                </span>
              </div>
              <ul className="text-sm text-slate-300 flex flex-col gap-1">
                {plan.exercises.map((e, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate">{getExercise(resolve(e.id))?.name}</span>
                    <span className="text-muted tabular shrink-0 ml-2">{e.sets}×{e.reps}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted">Día de descanso. Recupera, hidrátate y duerme bien.</p>
          )}
        </div>

        {/* Registro de sensaciones */}
        <div className="border-t border-line/60 pt-3">
          <p className="text-xs uppercase text-muted mb-3">¿Cómo te sentiste?</p>
          <Slider label="Energía" value={val.energy} onChange={(v) => up({ energy: v })} />
          <div className="h-3" />
          <Slider label="Fatiga / agujetas" value={val.soreness} onChange={(v) => up({ soreness: v })} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-slate-300">Agua (litros)</span>
            <div className="flex items-center gap-2">
              <button className="btn-ghost px-3 py-1" onClick={() => up({ water: Math.max(0, val.water - 0.5) })}>−</button>
              <span className="tabular w-10 text-center">{val.water}L</span>
              <button className="btn-ghost px-3 py-1" onClick={() => up({ water: val.water + 0.5 })}>+</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 mt-3">
            <input type="checkbox" checked={val.sleptWell} onChange={(e) => up({ sleptWell: e.target.checked })} className="accent-primary w-4 h-4" />
            Dormí bien
          </label>
          <textarea
            className="input min-h-[64px] mt-3"
            value={val.note}
            onChange={(e) => up({ note: e.target.value })}
            placeholder="Notas del día..."
          />
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            onSave(val)
            onClose()
          }}
        >
          Guardar
        </button>
      </div>
    </Modal>
  )
}

function Slider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm text-primary tabular">{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-primary" />
    </div>
  )
}
