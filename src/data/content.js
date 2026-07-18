// FAQ offline + tips + prompt del sistema del coach

export const FAQ = [
  {
    q: '¿Cuánta proteína necesito?',
    a: 'Entre 1.6 y 2.2 g por kg de peso corporal al día. Para ganar masa apunta a ~2.0 g/kg; en definición sube a 2.2 g/kg para preservar músculo. Reparte en 3-5 tomas.',
  },
  {
    q: '¿Cada cuánto cambio de rutina?',
    a: 'Cada 4-6 semanas conviene variar ejercicios, ángulos o rangos de repeticiones para seguir progresando y evitar estancamiento. La app te avisa cada 4 semanas.',
  },
  {
    q: '¿Cuál es el mejor horario para entrenar?',
    a: 'El mejor horario es el que puedas mantener con constancia. La fuerza suele ser algo mayor por la tarde, pero la adherencia importa más que la hora exacta.',
  },
  {
    q: '¿Es malo entrenar todos los días?',
    a: 'No si gestionas el volumen y la recuperación. Alterna grupos musculares e incluye al menos 1 día de descanso o descanso activo por semana. Escucha señales de fatiga.',
  },
  {
    q: '¿Debo hacer cardio si quiero ganar masa?',
    a: 'Sí, 2-3 sesiones cortas de cardio moderado mejoran la salud cardiovascular y la recuperación sin comprometer la ganancia muscular, siempre que cubras tus calorías.',
  },
  {
    q: '¿Debo entrenar en ayunas?',
    a: 'No es necesario ni superior para ganar músculo. Entrena cuando te sientas con energía; si entrenas en ayunas, unos BCAAs o una pequeña ingesta pueden ayudar.',
  },
  {
    q: '¿Vale la pena la creatina?',
    a: 'Es el suplemento con más evidencia. 5 g diarios de monohidratada mejoran fuerza y volumen. Segura para personas sanas; bebe suficiente agua.',
  },
]

export const TIPS = [
  'Bebe agua 15 min antes de entrenar para mejorar el rendimiento.',
  'Duerme 7-9 horas: la recuperación es donde crece el músculo.',
  'Estira y camina 5 min post-entreno para reducir las agujetas (DOMS).',
  'Prioriza los ejercicios compuestos al inicio, cuando tienes más energía.',
  'Registra tus pesos: lo que se mide, mejora.',
  'La proteína en cada comida maximiza la síntesis muscular.',
  'Progresa de forma gradual: +2.5kg o +1 rep antes de saltar de peso.',
  'El descanso entre series importa: 2-3 min para fuerza, 60-90s para hipertrofia.',
]

export function tipOfDay() {
  const day = Math.floor(Date.now() / 86400000)
  return TIPS[day % TIPS.length]
}

export const GOALS = {
  masa: { label: 'Ganar masa muscular', reps: '8-12', sets: '3-4', rest: '90s' },
  definicion: { label: 'Definición', reps: '12-15', sets: '3-4', rest: '60s' },
  resistencia: { label: 'Resistencia', reps: '15-20', sets: '2-3', rest: '45s' },
  funcional: { label: 'Funcional / fuerza', reps: '6-8', sets: '4-5', rest: '120s' },
  perdida: { label: 'Pérdida de peso', reps: '12-15', sets: '3', rest: '45s' },
}

// Prompt del sistema del Coach IA (se usa si hay API key de Mistral)
// Fecha y hora actuales en la zona horaria de Bogotá (America/Bogota, UTC-5, sin horario de verano).
// Devuelve algo como: "jueves, 18 de julio de 2026, 3:45 p. m."
export function bogotaNow(date = new Date()) {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function buildCoachPrompt(profile, metabolic, context = {}) {
  const g = GOALS[profile?.goal]?.label || 'General'
  const ctx = []
  if (context.todayPlan) ctx.push(`- Entrenamiento de hoy: ${context.todayPlan}`)
  if (context.streak != null) ctx.push(`- Racha actual: ${context.streak} días`)
  if (context.totalWorkouts != null) ctx.push(`- Sesiones completadas: ${context.totalWorkouts}`)
  if (context.recentExercises) ctx.push(`- Ejercicios recientes: ${context.recentExercises}`)
  if (context.eatenToday)
    ctx.push(`- Consumido hoy: ${context.eatenToday.kcal} kcal (P ${context.eatenToday.p} / C ${context.eatenToday.c} / G ${context.eatenToday.f})`)
  if (context.activeSupplements) ctx.push(`- Suplementos activos: ${context.activeSupplements}`)

  return `Eres "Coach AI", un coach profesional de gimnasio con 15 años de experiencia.
FECHA Y HORA ACTUAL (zona horaria de Bogotá, Colombia — UTC-5): ${bogotaNow()}.
Usa esta fecha y hora como referencia real para saludos según el momento del día, planificar la semana, calcular descansos y responder preguntas sobre "hoy", "mañana", "esta semana", etc.
REGLAS: Sé motivador pero realista. Personaliza según el perfil y el contexto reciente. NUNCA des diagnósticos médicos (refiere a un doctor). Responde en español latino, cercano y profesional. Sé conciso (máx ~120 palabras).
NO recomiendes esteroides ni dietas peligrosas.
PERFIL DEL USUARIO:
- Nombre: ${profile?.name || 'Atleta'}
- Edad: ${profile?.age} años · Sexo: ${profile?.sex}
- Peso: ${profile?.weight}kg · Altura: ${profile?.height}cm
- Objetivo: ${g}
- Experiencia: ${profile?.experience}
- Días/semana: ${profile?.daysPerWeek}
- Lesiones/restricciones: ${profile?.injuries || 'ninguna'}
- Calorías objetivo: ${metabolic?.calories} kcal (P ${metabolic?.macros?.protein} / C ${metabolic?.macros?.carbs} / G ${metabolic?.macros?.fat})
CONTEXTO RECIENTE:
${ctx.join('\n') || '- (sin actividad reciente registrada)'}`
}

// Respuestas de respaldo cuando no hay conexión / API key
export function offlineCoachReply(message, profile) {
  const m = message.toLowerCase()
  const hit = FAQ.find((f) =>
    f.q.toLowerCase().split(' ').some((w) => w.length > 4 && m.includes(w))
  )
  if (hit) return hit.a
  if (m.includes('proteina') || m.includes('proteína'))
    return FAQ[0].a
  if (m.includes('creatina')) return FAQ[6].a
  if (m.includes('rutina') || m.includes('cambiar')) return FAQ[1].a
  return `Estoy en modo offline ahora mismo, ${profile?.name || 'crack'} 💪. Puedo responder mejor con conexión y tu clave de Mistral configurada. Mientras tanto: mantén la constancia, prioriza proteína y sueño, y progresa poco a poco. Revisa la sección de Tips para consejos rápidos.`
}
