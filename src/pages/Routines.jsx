import { useState } from 'react'
import { useStore } from '../store/useStore'
import { getExercise, findAlternatives, MUSCLE_GROUPS } from '../data/exercises'
import { Card, GroupBadge, Modal, ExerciseMedia } from '../components/ui'
import { RefreshCw, Info, Repeat, ChevronDown, Dumbbell, Clock, Flame } from 'lucide-react'

export default function Routines() {
  const { routine, regenerateRoutine, substitutions, substituteExercise } = useStore()
  const [open, setOpen] = useState(-1)
  const [detail, setDetail] = useState(null)
  const [swap, setSwap] = useState(null)

  if (!routine) return null
  const resolve = (id) => substitutions[id] || id

  const trainingDays = routine.week.filter((d) => !d.rest)
  const weeklyMin = trainingDays.reduce((a, d) => a + (d.estimatedMin || 0), 0)
  const vol = routine.weeklyVolume || {}

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl uppercase accent-bar">Mi rutina</h1>
        <button className="btn-ghost text-sm py-2" onClick={regenerateRoutine}>
          <RefreshCw className="w-4 h-4" /> Regenerar
        </button>
      </div>

      {/* Resumen del plan */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat icon={Dumbbell} value={routine.days} label="días/semana" />
        <MiniStat icon={Clock} value={`${routine.sessionMin}′`} label="por sesión" />
        <MiniStat icon={Flame} value={`${Math.round(weeklyMin / 60 * 10) / 10}h`} label="semanal" />
      </div>

      {/* Volumen semanal por grupo */}
      {Object.keys(vol).length > 0 && (
        <Card>
          <p className="text-xs uppercase text-muted mb-2">Series semanales por grupo</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(vol)
              .sort((a, b) => b[1] - a[1])
              .map(([g, sets]) => (
                <span
                  key={g}
                  className="chip text-slate-100 tabular"
                  style={{ borderColor: MUSCLE_GROUPS[g]?.color + '66', background: MUSCLE_GROUPS[g]?.color + '18', cursor: 'default' }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: MUSCLE_GROUPS[g]?.color }} />
                  {MUSCLE_GROUPS[g]?.label}: {sets}
                </span>
              ))}
          </div>
        </Card>
      )}

      <p className="text-xs text-muted -mt-1">
        Ciclo {routine.cycle + 1}/3 · rota los ejercicios cada 4 semanas para seguir progresando.
      </p>

      {routine.week.map((day, i) => (
        <Card key={i} className="p-0 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4" onClick={() => setOpen(open === i ? -1 : i)}>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-11 rounded-full" style={{ background: MUSCLE_GROUPS[day.groups[0]]?.color }} />
              <div className="text-left">
                <div className="text-xs uppercase text-muted">{day.day}</div>
                <div className="text-lg uppercase font-display leading-tight">{day.title}</div>
                {!day.rest && (
                  <div className="text-xs text-muted tabular flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> ~{day.estimatedMin} min · {day.exercises.length} ejercicios
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>

          {open === i && !day.rest && (
            <div className="border-t border-line/60 divide-y divide-line/60 animate-fade-up">
              {day.exercises.map((ex, j) => {
                const meta = getExercise(resolve(ex.id))
                const swapped = substitutions[ex.id]
                return (
                  <div key={j} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-lg bg-bg-soft flex items-center justify-center shrink-0">
                      <span className="font-display text-primary tabular">{j + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {meta?.name}
                        {swapped && <span className="text-xs text-accent ml-2">(sustituido)</span>}
                      </div>
                      <div className="text-sm text-muted tabular">
                        {ex.sets} × {ex.reps} · descanso {ex.rest} · RPE {ex.rpe}
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-primary" aria-label="Info" onClick={() => setDetail(resolve(ex.id))}>
                      <Info className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-accent" aria-label="Sustituir" onClick={() => setSwap(ex.id)}>
                      <Repeat className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          {open === i && day.rest && (
            <div className="border-t border-line/60 p-4 text-sm text-muted">
              Descanso o descanso activo (caminar, movilidad, estiramientos).
            </div>
          )}
        </Card>
      ))}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={getExercise(detail)?.name}>
        {detail && <ExerciseDetail ex={getExercise(detail)} />}
      </Modal>

      <Modal open={!!swap} onClose={() => setSwap(null)} title="Sustituir ejercicio">
        {swap && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted mb-1">Elige una alternativa para el mismo grupo muscular:</p>
            {findAlternatives(resolve(swap)).map((alt) => (
              <button
                key={alt.id}
                className="text-left px-4 py-3 rounded-xl border border-line/70 bg-bg-soft hover:border-accent transition-colors"
                onClick={() => {
                  substituteExercise(swap, alt.id)
                  setSwap(null)
                }}
              >
                <div className="font-medium">{alt.name}</div>
                <div className="text-sm text-muted">{alt.equip} · {alt.type}</div>
              </button>
            ))}
            {findAlternatives(resolve(swap)).length === 0 && <p className="text-sm text-muted">No hay alternativas disponibles.</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}

function MiniStat({ icon: Icon, value, label }) {
  return (
    <Card className="p-3 flex flex-col gap-1 items-start">
      <Icon className="w-4 h-4 text-primary" />
      <span className="font-display text-2xl text-slate-100 tabular leading-none mt-1">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </Card>
  )
}

function ExerciseDetail({ ex }) {
  return (
    <div className="flex flex-col gap-4">
      <ExerciseMedia exercise={ex} />
      <div className="flex flex-wrap gap-2">
        <GroupBadge group={ex.group} />
        <span className="chip border-line text-slate-300" style={{ cursor: 'default' }}>{ex.type}</span>
        <span className="chip border-line text-slate-300" style={{ cursor: 'default' }}>{ex.equip}</span>
      </div>
      <div>
        <h4 className="text-sm uppercase text-primary mb-1">Técnica</h4>
        <p className="text-sm text-slate-200">{ex.cues}</p>
      </div>
      <div>
        <h4 className="text-sm uppercase text-red-400 mb-1">Errores comunes</h4>
        <p className="text-sm text-slate-200">{ex.errors}</p>
      </div>
      <a
        className="btn-ghost"
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent('como hacer ' + ex.name + ' técnica correcta')}`}
        target="_blank"
        rel="noreferrer"
      >
        Ver video tutorial
      </a>
    </div>
  )
}
