import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, todayStr } from '../store/useStore'
import { getExercise } from '../data/exercises'
import { suggestedWeight, estimate1RM } from '../utils/calculations'
import { platesPerSide, warmupSets, lastRecordFor, suggestNextWeight } from '../utils/gymTools'
import { ExerciseMedia, Modal } from '../components/ui'
import {
  X, Check, SkipForward, Plus, Minus, Timer, Trophy, Dumbbell,
  History, TrendingUp, Disc3, Flame,
} from 'lucide-react'

export default function LiveWorkout() {
  const { routine, profile, substitutions, logWorkout, workoutLog } = useStore()
  const nav = useNavigate()
  const dow = (new Date().getDay() + 6) % 7
  const plan = routine?.week?.[dow]
  const resolve = (id) => substitutions[id] || id

  const [started] = useState(Date.now())
  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [rest, setRest] = useState(0)
  const [records, setRecords] = useState({})
  const [done, setDone] = useState(false)
  const [tools, setTools] = useState(false)

  const exercises = plan?.exercises || []
  const current = exercises[exIdx]
  const meta = current ? getExercise(resolve(current.id)) : null

  // Historial del ejercicio actual + sugerencia de sobrecarga progresiva
  const last = useMemo(
    () => (current ? lastRecordFor(workoutLog, resolve(current.id)) : null),
    [current?.id] // eslint-disable-line
  )
  const suggestion = useMemo(() => suggestNextWeight(last, current?.reps), [last, current?.reps])

  const formulaWeight = meta
    ? suggestedWeight(profile.weight, profile.experience, meta.type === 'compuesto')
    : 0

  const [weight, setWeight] = useState(formulaWeight)
  const [reps, setReps] = useState(0)
  const [rpe, setRpe] = useState(8)

  // Prefill inteligente: última sesión (con progresión) > fórmula por peso corporal
  useEffect(() => {
    setWeight(suggestion?.weight ?? formulaWeight)
    setReps(parseInt(current?.reps) || 10)
  }, [exIdx]) // eslint-disable-line

  // Mantiene la pantalla encendida durante el entrenamiento (Wake Lock)
  useEffect(() => {
    let lock = null
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {}
    }
    request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release?.().catch(() => {})
    }
  }, [])

  // Timer de descanso
  useEffect(() => {
    if (rest <= 0) return
    const t = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          try {
            navigator.vibrate?.(200)
            playBeep()
          } catch {}
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [rest > 0]) // eslint-disable-line

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      o.frequency.value = 880
      o.start()
      g.gain.setValueAtTime(0.2, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      o.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  if (!plan || plan.rest || exercises.length === 0) {
    return (
      <Fullscreen>
        <div className="text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300">Hoy es día de descanso.</p>
          <button className="btn-primary mt-4" onClick={() => nav('/')}>
            Volver
          </button>
        </div>
      </Fullscreen>
    )
  }

  const completeSet = () => {
    const rec = records[current.id] ? [...records[current.id]] : []
    rec.push({ weight: +weight, reps: +reps, rpe: +rpe })
    setRecords({ ...records, [current.id]: rec })
    const restSec = parseInt(current.rest) || 90
    if (setIdx + 1 < current.sets) {
      setSetIdx(setIdx + 1)
      setRest(restSec)
    } else {
      nextExercise()
    }
  }

  const nextExercise = () => {
    setRest(0)
    if (exIdx + 1 < exercises.length) {
      setExIdx(exIdx + 1)
      setSetIdx(0)
    } else {
      finish()
    }
  }

  const finish = () => {
    const duration = Math.round((Date.now() - started) / 60000)
    logWorkout({
      date: todayStr(),
      dayTitle: plan.title,
      duration,
      exercises: exercises.map((e) => ({
        id: resolve(e.id),
        name: getExercise(resolve(e.id))?.name,
        sets: records[e.id] || [],
      })),
    })
    setDone(true)
  }

  if (done)
    return (
      <Summary plan={plan} records={records} started={started} nav={nav} exercises={exercises} resolve={resolve} workoutLog={workoutLog} />
    )

  const mm = String(Math.floor(rest / 60)).padStart(2, '0')
  const ss = String(rest % 60).padStart(2, '0')
  const showTools = meta?.equip === 'barra' || meta?.type === 'compuesto'

  return (
    <Fullscreen>
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button className="p-2 text-slate-400" onClick={() => nav('/')} aria-label="Salir">
            <X className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted tabular">
            Ejercicio {exIdx + 1}/{exercises.length}
          </span>
          <button className="text-sm text-red-400 font-semibold" onClick={finish}>
            Terminar
          </button>
        </div>

        {/* Progreso */}
        <div className="flex gap-1">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < exIdx ? 'bg-accent' : i === exIdx ? 'bg-primary' : 'bg-bg-soft'}`}
            />
          ))}
        </div>

        {/* Card principal */}
        <div className="card p-5 text-center">
          <span className="chip border-primary/40 text-primary bg-primary/10 mx-auto" style={{ cursor: 'default' }}>
            Serie {setIdx + 1} / {current.sets}
          </span>
          <h1 className="text-3xl uppercase mt-3">{meta?.name}</h1>
          {rest === 0 && (
            <div className="max-w-[160px] mx-auto mt-3">
              <ExerciseMedia exercise={meta} />
            </div>
          )}
          <p className="text-sm text-muted mt-2">{meta?.cues}</p>

          {/* Última sesión + progresión */}
          {last && rest === 0 && (
            <div className="mt-3 flex flex-col gap-1 items-center">
              <span className="text-xs text-muted tabular flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Última vez ({last.date.slice(5)}): {last.best.weight}kg × {last.best.reps}
              </span>
              {suggestion && (
                <span
                  className={`chip text-xs ${suggestion.increased ? 'border-accent/40 text-accent bg-accent/10' : 'border-line text-slate-300'}`}
                  style={{ cursor: 'default' }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {suggestion.increased
                    ? `¡Sube a ${suggestion.weight}kg! Superaste el rango`
                    : `Repite ${suggestion.weight}kg hasta dominar el rango`}
                </span>
              )}
            </div>
          )}

          {/* Timer de descanso */}
          {rest > 0 && (
            <div className="my-5 animate-scale-in">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Timer className="w-6 h-6" />
                <span className="text-5xl font-display tabular">
                  {mm}:{ss}
                </span>
              </div>
              <p className="text-sm text-muted mt-1">Descanso — prepárate para la siguiente serie</p>
              <div className="flex gap-2 justify-center mt-3">
                <button className="btn-ghost text-sm py-2" onClick={() => setRest((r) => r + 30)}>
                  +30s
                </button>
                <button className="btn-ghost text-sm py-2" onClick={() => setRest(0)}>
                  Saltar descanso
                </button>
              </div>
            </div>
          )}

          {/* Inputs de la serie */}
          {rest === 0 && (
            <div className="mt-4 flex flex-col gap-4 animate-fade-up">
              <div className="grid grid-cols-2 gap-3">
                <Counter label="Peso (kg)" value={weight} onChange={setWeight} step={2.5} />
                <Counter label="Reps" value={reps} onChange={setReps} step={1} />
              </div>
              <div>
                <label className="label text-left">Esfuerzo (RPE): {rpe}/10</label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="w-full accent-primary"
                />
              </div>
              <button className="btn-accent" onClick={completeSet}>
                <Check className="w-5 h-5" /> Completar serie
              </button>
              <div className="flex items-center justify-center gap-4">
                {showTools && (
                  <button className="text-sm text-slate-300 flex items-center gap-1" onClick={() => setTools(true)}>
                    <Disc3 className="w-4 h-4 text-primary" /> Discos y calentamiento
                  </button>
                )}
                <button className="text-sm text-muted flex items-center gap-1" onClick={nextExercise}>
                  <SkipForward className="w-4 h-4" /> Saltar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Series registradas */}
        {records[current.id]?.length > 0 && (
          <div className="card p-4">
            <p className="text-xs uppercase text-muted mb-2">Series de este ejercicio</p>
            <div className="flex flex-wrap gap-2">
              {records[current.id].map((s, i) => (
                <span key={i} className="chip border-line text-slate-200 tabular" style={{ cursor: 'default' }}>
                  {s.weight}kg × {s.reps}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Herramientas: discos + calentamiento */}
      <Modal open={tools} onClose={() => setTools(false)} title="Discos y calentamiento">
        <ToolsPanel weight={+weight} isBar={meta?.equip === 'barra'} isCompound={meta?.type === 'compuesto'} />
      </Modal>
    </Fullscreen>
  )
}

function ToolsPanel({ weight, isBar, isCompound }) {
  const [bar, setBar] = useState(20)
  const { plates, remainder, possible } = platesPerSide(weight, bar)
  const warmup = warmupSets(weight, isBar ? bar : 0)

  return (
    <div className="flex flex-col gap-5">
      {isBar && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm uppercase text-primary flex items-center gap-1.5">
              <Disc3 className="w-4 h-4" /> Discos por lado · {weight}kg
            </h4>
            <select className="input py-1 w-auto min-h-0 text-sm" value={bar} onChange={(e) => setBar(+e.target.value)}>
              {[20, 15, 10].map((b) => (
                <option key={b} value={b}>Barra {b}kg</option>
              ))}
            </select>
          </div>
          {weight <= bar ? (
            <p className="text-sm text-muted">Con la barra sola ya llegas ({bar}kg).</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {plates.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center rounded-full font-display tabular text-slate-950"
                    style={{
                      width: 40 + p, height: 40 + p, fontSize: 13,
                      background: p >= 20 ? '#F97316' : p >= 10 ? '#FB923C' : p >= 5 ? '#22C55E' : '#8A98AD',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
              {!possible && remainder > 0 && (
                <p className="text-xs text-muted mt-2 tabular">
                  Faltan {remainder.toFixed(2)}kg por lado (no hay disco tan pequeño): carga {(weight - remainder * 2).toFixed(1)}kg.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {isCompound && (
        <div>
          <h4 className="text-sm uppercase text-primary flex items-center gap-1.5 mb-2">
            <Flame className="w-4 h-4" /> Series de aproximación
          </h4>
          <div className="flex flex-col gap-1.5">
            {warmup.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-bg-soft text-sm">
                <span className="text-slate-300">{s.label}</span>
                <span className="tabular text-slate-100">
                  {s.weight}kg × {s.reps}
                </span>
              </div>
            ))}
            <p className="text-xs text-muted mt-1">Descansa 60-90s entre series de aproximación. Luego, a tu peso de trabajo.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Fullscreen({ children }) {
  return <div className="min-h-dvh bg-bg flex items-center justify-center p-4">{children}</div>
}

function Counter({ label, value, onChange, step }) {
  return (
    <div>
      <label className="label text-left">{label}</label>
      <div className="flex items-center gap-2">
        <button className="btn-ghost px-0 w-11 shrink-0" onClick={() => onChange(Math.max(0, +value - step))} aria-label="Menos">
          <Minus className="w-4 h-4" />
        </button>
        <input type="number" className="input text-center tabular" value={value} onChange={(e) => onChange(e.target.value)} />
        <button className="btn-ghost px-0 w-11 shrink-0" onClick={() => onChange(+value + step)} aria-label="Más">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function Summary({ plan, records, started, nav, exercises, resolve, workoutLog }) {
  const duration = Math.round((Date.now() - started) / 60000)
  const totalSets = Object.values(records).reduce((a, r) => a + r.length, 0)
  const totalVolume = Object.values(records)
    .flat()
    .reduce((a, s) => a + s.weight * s.reps, 0)

  const best = Object.entries(records).reduce(
    (acc, [id, sets]) => {
      const top = sets.reduce((m, s) => Math.max(m, estimate1RM(s.weight, s.reps)), 0)
      return top > acc.val ? { id, val: top } : acc
    },
    { id: null, val: 0 }
  )

  // PRs: compara el mejor 1RM de hoy contra todo el historial anterior
  const prs = Object.entries(records).filter(([id, sets]) => {
    const todayBest = sets.reduce((m, s) => Math.max(m, estimate1RM(s.weight, s.reps)), 0)
    if (!todayBest) return false
    let historicBest = 0
    for (const w of workoutLog.slice(1)) {
      const ex = w.exercises?.find((e) => e.id === id)
      ex?.sets?.forEach((s) => {
        historicBest = Math.max(historicBest, estimate1RM(s.weight, s.reps))
      })
    }
    return historicBest > 0 && todayBest > historicBest
  })

  return (
    <Fullscreen>
      <div className="w-full max-w-md flex flex-col gap-4 animate-fade-up text-center">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-3xl uppercase">¡Entrenamiento completado!</h1>
        <p className="text-muted">{plan.title}</p>

        <div className="grid grid-cols-3 gap-3">
          <MiniStat value={duration} unit="min" label="Duración" />
          <MiniStat value={totalSets} unit="series" label="Completadas" />
          <MiniStat value={Math.round(totalVolume)} unit="kg" label="Volumen total" />
        </div>

        {prs.length > 0 && (
          <div className="card p-4 flex items-center gap-3 text-left border-primary/40">
            <Trophy className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="text-sm text-slate-100 font-semibold">¡Nuevo récord personal!</p>
              <p className="text-xs text-muted">
                {prs.map(([id]) => getExercise(id)?.name).join(' · ')}
              </p>
            </div>
          </div>
        )}

        {best.id && prs.length === 0 && (
          <div className="card p-4 flex items-center gap-3 text-left">
            <Trophy className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="text-sm text-slate-200 font-semibold">Mejor esfuerzo: {getExercise(best.id)?.name}</p>
              <p className="text-xs text-muted tabular">1RM estimado: {best.val}kg</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <button className="btn-primary" onClick={() => nav('/nutrition')}>
            Registrar comida post-entreno
          </button>
          <button className="btn-ghost" onClick={() => nav('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    </Fullscreen>
  )
}

function MiniStat({ value, unit, label }) {
  return (
    <div className="card p-3">
      <div className="font-display text-2xl text-primary tabular">{value}</div>
      <div className="text-[11px] text-muted">
        {unit} · {label}
      </div>
    </div>
  )
}
