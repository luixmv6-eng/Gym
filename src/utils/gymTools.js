// Herramientas de gimnasio: discos, calentamiento y sobrecarga progresiva.

export const BAR_WEIGHTS = [20, 15, 10]
export const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] // kg, por lado

// Discos por lado para llegar al peso objetivo con una barra dada.
export function platesPerSide(target, bar = 20) {
  const perSide = (target - bar) / 2
  if (perSide < 0) return { plates: [], remainder: 0, possible: false }
  let rem = perSide
  const plates = []
  for (const p of PLATES) {
    while (rem >= p - 1e-9) {
      plates.push(p)
      rem = +(rem - p).toFixed(2)
    }
  }
  return { plates, remainder: rem, possible: rem < 1.24 }
}

// Series de aproximación (calentamiento) hasta el peso de trabajo.
// Solo tiene sentido para ejercicios con barra/carga significativa.
export function warmupSets(workingWeight, bar = 20) {
  if (!workingWeight || workingWeight <= bar + 10) {
    return [{ label: 'Barra sola', weight: bar, reps: 10 }]
  }
  const round = (w) => Math.max(bar, Math.round(w / 2.5) * 2.5)
  return [
    { label: 'Barra sola', weight: bar, reps: 10 },
    { label: '50%', weight: round(workingWeight * 0.5), reps: 6 },
    { label: '70%', weight: round(workingWeight * 0.7), reps: 4 },
    { label: '85%', weight: round(workingWeight * 0.85), reps: 2 },
  ].filter((s, i, arr) => i === 0 || s.weight > arr[i - 1].weight)
}

// Busca el último registro de un ejercicio en el historial (log más reciente primero).
export function lastRecordFor(workoutLog, exerciseId) {
  for (const w of workoutLog || []) {
    const ex = w.exercises?.find((e) => e.id === exerciseId && e.sets?.length)
    if (ex) {
      // mejor serie de esa sesión (mayor peso; a igualdad, más reps)
      const best = [...ex.sets].sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0]
      return { date: w.date, best, sets: ex.sets }
    }
  }
  return null
}

// Sobrecarga progresiva: si en la última sesión alcanzaste el tope del rango
// de reps, sube 2.5kg; si no, repite peso hasta dominarlo.
export function suggestNextWeight(last, targetRepsStr) {
  if (!last?.best?.weight) return null
  const parts = String(targetRepsStr || '').split('-')
  const top = parseInt(parts[1] || parts[0]) || 12
  const hitTop = last.best.reps >= top
  return {
    weight: hitTop ? +(last.best.weight + 2.5).toFixed(1) : last.best.weight,
    increased: hitTop,
  }
}
