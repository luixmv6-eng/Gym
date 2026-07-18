import { EXERCISES_BY_GROUP, MUSCLE_GROUPS } from '../data/exercises'
import { GOALS } from '../data/content'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Distribución de días de entrenamiento en la semana (para dejar descansos espaciados)
const WEEK_PATTERN = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4], // Lun / Mié / Vie
  4: [0, 1, 3, 4], // Lun-Mar / Jue-Vie
  5: [0, 1, 2, 3, 4], // Lun-Vie
  6: [0, 1, 2, 3, 4, 5], // Lun-Sáb
}

// Estimación de tiempo por serie y transición entre ejercicios (segundos)
const WORK_PER_SET = 40
const TRANSITION = 45

const restSeconds = (goal) => parseInt(GOALS[goal]?.rest) || 75

export function exerciseMinutes(sets, restSec) {
  return (sets * (WORK_PER_SET + restSec) + TRANSITION) / 60
}

// Split según los días que la persona PUEDE entrenar (frecuencia proporcional)
function splitFor(days) {
  switch (days) {
    case 1:
    case 2:
      return [
        ['piernas', 'pecho', 'espalda', 'hombros', 'core'],
        ['piernas', 'espalda', 'pecho', 'brazos', 'core'],
      ].slice(0, days)
    case 3:
      return [
        ['piernas', 'pecho', 'espalda', 'hombros', 'core'], // full body A
        ['piernas', 'espalda', 'pecho', 'brazos', 'core'], // full body B
        ['piernas', 'hombros', 'espalda', 'pecho', 'core'], // full body C
      ]
    case 4:
      return [
        ['pecho', 'hombros', 'brazos'], // upper
        ['piernas', 'core'], // lower
        ['espalda', 'brazos', 'hombros'], // upper
        ['piernas', 'core'], // lower
      ]
    case 5:
      return [
        ['pecho', 'hombros', 'brazos'], // push
        ['espalda', 'brazos'], // pull
        ['piernas', 'core'], // legs
        ['pecho', 'espalda', 'hombros'], // upper
        ['piernas', 'core'], // lower
      ]
    default: // 6
      return [
        ['pecho', 'hombros', 'brazos'],
        ['espalda', 'brazos'],
        ['piernas', 'core'],
        ['pecho', 'hombros', 'brazos'],
        ['espalda', 'brazos'],
        ['piernas', 'core'],
      ]
  }
}

function titleFor(groups) {
  if (groups.length >= 4) return 'Full body'
  return groups.map((g) => MUSCLE_GROUPS[g]?.label || g).join(' + ')
}

// Ordena candidatos: primero compuestos (uno por grupo, round-robin), luego aislamientos.
function candidatesFor(groups, cycle) {
  const pools = groups.map((g) => {
    const pool = EXERCISES_BY_GROUP[g] || []
    const start = (cycle * 2) % Math.max(1, pool.length)
    const rotated = [...pool.slice(start), ...pool.slice(0, start)]
    return {
      compound: rotated.filter((e) => e.type === 'compuesto'),
      isolation: rotated.filter((e) => e.type === 'aislamiento'),
    }
  })
  const out = []
  for (let r = 0; r < 3; r++) pools.forEach((p) => p.compound[r] && out.push(p.compound[r]))
  for (let r = 0; r < 3; r++) pools.forEach((p) => p.isolation[r] && out.push(p.isolation[r]))
  return [...new Map(out.map((e) => [e.id, e])).values()]
}

// Selecciona ejercicios hasta llenar el presupuesto de tiempo de la sesión.
function fitToBudget(cands, budgetMin, goal, experience) {
  const rest = restSeconds(goal)
  const setsFor = (ex) =>
    ex.type === 'compuesto' ? (experience === 'principiante' ? 3 : 4) : 3
  const chosen = []
  let mins = 0
  for (const ex of cands) {
    const sets = setsFor(ex)
    const t = exerciseMinutes(sets, rest)
    if (chosen.length >= 3 && mins + t > budgetMin) break
    if (chosen.length >= 8) break
    chosen.push({ id: ex.id, sets, reps: GOALS[goal].reps, rest: GOALS[goal].rest, rpe: '7-9' })
    mins += t
  }
  return chosen
}

// Volumen semanal por grupo muscular (series totales)
function weeklyVolume(week) {
  const vol = {}
  week.forEach((d) => {
    if (d.rest) return
    d.exercises.forEach((e) => {
      const g = EXERCISES_BY_GROUP // no-op para claridad
      const ex = Object.values(EXERCISES_BY_GROUP).flat().find((x) => x.id === e.id)
      if (ex) vol[ex.group] = (vol[ex.group] || 0) + e.sets
    })
  })
  return vol
}

// Genera la rutina semanal completa, adaptada a días/semana y tiempo de sesión.
export function generateRoutine(profile, cycle = 0) {
  const days = profile?.daysPerWeek || 3
  const goal = profile?.goal || 'masa'
  const sessionMin = profile?.sessionMin || 60
  const experience = profile?.experience || 'principiante'

  const splits = splitFor(days)
  const pattern = WEEK_PATTERN[days] || WEEK_PATTERN[3]
  const warmup = sessionMin <= 30 ? 5 : 8
  const cooldown = 3
  const budget = Math.max(15, sessionMin - warmup - cooldown)

  const week = []
  let trainIdx = 0
  for (let i = 0; i < 7; i++) {
    if (pattern.includes(i)) {
      const groups = splits[trainIdx % splits.length]
      trainIdx++
      const exercises = fitToBudget(candidatesFor(groups, cycle), budget, goal, experience)
      const estimatedMin = Math.round(
        warmup + cooldown + exercises.reduce((a, e) => a + exerciseMinutes(e.sets, restSeconds(goal)), 0)
      )
      week.push({ day: DAY_NAMES[i], rest: false, title: titleFor(groups), groups, warmup, cooldown, estimatedMin, exercises })
    } else {
      week.push({ day: DAY_NAMES[i], rest: true, title: 'Descanso', groups: ['descanso'], exercises: [], estimatedMin: 0 })
    }
  }

  return {
    cycle,
    createdAt: Date.now(),
    goal,
    days,
    sessionMin,
    week,
    weeklyVolume: weeklyVolume(week),
  }
}
