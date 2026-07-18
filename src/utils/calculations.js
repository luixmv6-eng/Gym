// ---- Cálculos fisiológicos y de nutrición ----

// IMC = peso(kg) / altura(m)^2
export function calcBMI(weight, heightCm) {
  const h = heightCm / 100
  if (!weight || !h) return 0
  return +(weight / (h * h)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Bajo peso', color: '#60A5FA' }
  if (bmi < 25) return { label: 'Normal', color: '#22C55E' }
  if (bmi < 30) return { label: 'Sobrepeso', color: '#F97316' }
  return { label: 'Obesidad', color: '#EF4444' }
}

// BMR (Mifflin-St Jeor)
export function calcBMR({ weight, height, age, sex }) {
  const base = 10 * weight + 6.25 * height - 5 * age
  const adj = sex === 'female' ? -161 : 5
  return Math.round(base + adj)
}

// Factor de actividad según días/semana de entrenamiento
export function activityFactor(daysPerWeek) {
  const map = { 3: 1.375, 4: 1.465, 5: 1.55, 6: 1.725, 7: 1.9 }
  return map[daysPerWeek] || 1.375
}

export function calcTDEE(bmr, daysPerWeek) {
  return Math.round(bmr * activityFactor(daysPerWeek))
}

// Calorías objetivo según meta
export function targetCalories(tdee, goal) {
  switch (goal) {
    case 'masa':
      return tdee + 400
    case 'definicion':
    case 'perdida':
      return tdee - 450
    default:
      return tdee
  }
}

// Reparto de macros (gramos) según objetivo
export function calcMacros(calories, goal) {
  let p, c, f // % del total
  switch (goal) {
    case 'masa':
      ;[p, c, f] = [0.4, 0.4, 0.2]
      break
    case 'definicion':
    case 'perdida':
      ;[p, c, f] = [0.45, 0.35, 0.2]
      break
    default:
      ;[p, c, f] = [0.35, 0.45, 0.2]
  }
  return {
    protein: Math.round((calories * p) / 4),
    carbs: Math.round((calories * c) / 4),
    fat: Math.round((calories * f) / 9),
  }
}

// 1RM estimado (Epley)
export function estimate1RM(weight, reps) {
  if (!weight || !reps) return 0
  return Math.round(weight * (1 + 0.0333 * reps))
}

// Peso sugerido para un ejercicio según experiencia y peso corporal
export function suggestedWeight(bodyWeight, experience, isCompound) {
  const mult = {
    principiante: isCompound ? 0.6 : 0.25,
    intermedio: isCompound ? 1.1 : 0.4,
    avanzado: isCompound ? 1.6 : 0.6,
  }
  const m = mult[experience] ?? 0.6
  // redondea a múltiplos de 2.5kg
  return Math.max(2.5, Math.round((bodyWeight * m) / 2.5) * 2.5)
}

// Deriva todo el perfil metabólico desde los datos del formulario
export function buildMetabolicProfile(profile) {
  const bmr = calcBMR(profile)
  const tdee = calcTDEE(bmr, profile.daysPerWeek)
  const calories = targetCalories(tdee, profile.goal)
  const macros = calcMacros(calories, profile.goal)
  const bmi = calcBMI(profile.weight, profile.height)
  return { bmr, tdee, calories, macros, bmi }
}
