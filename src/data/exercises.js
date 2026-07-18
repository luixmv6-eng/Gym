// Base local de ejercicios (offline). Enriquecida con GIFs de ExerciseDB.
// group: pecho | espalda | piernas | hombros | brazos | core | cardio
// type: compuesto | aislamiento

export const MUSCLE_GROUPS = {
  pecho: { label: 'Pecho', color: '#EF4444' },
  espalda: { label: 'Espalda', color: '#3B82F6' },
  piernas: { label: 'Piernas', color: '#22C55E' },
  hombros: { label: 'Hombros', color: '#EAB308' },
  brazos: { label: 'Brazos', color: '#A855F7' },
  core: { label: 'Core', color: '#14B8A6' },
  cardio: { label: 'Cardio', color: '#F97316' },
  descanso: { label: 'Descanso', color: '#64748B' },
}

export const EXERCISES = [
  // ---------- PECHO ----------
  { id: 'bench-press', name: 'Press de banca', group: 'pecho', type: 'compuesto', equip: 'barra', cues: 'Escápulas retraídas, baja a la línea del pezón, codos ~45°.', errors: 'Rebotar la barra, despegar glúteos.' },
  { id: 'incline-bb-press', name: 'Press inclinado con barra', group: 'pecho', type: 'compuesto', equip: 'barra', cues: 'Banco a 30°, recorrido completo, pecho arriba.', errors: 'Inclinación excesiva, codos muy abiertos.' },
  { id: 'incline-db-press', name: 'Press inclinado con mancuernas', group: 'pecho', type: 'compuesto', equip: 'mancuernas', cues: 'Banco 30-45°, aprieta arriba sin chocar mancuernas.', errors: 'Rango parcial.' },
  { id: 'flat-db-press', name: 'Press plano con mancuernas', group: 'pecho', type: 'compuesto', equip: 'mancuernas', cues: 'Baja controlado, siente el estiramiento del pecho.', errors: 'Bajar demasiado con hombro débil.' },
  { id: 'cable-fly', name: 'Aperturas en polea', group: 'pecho', type: 'aislamiento', equip: 'polea', cues: 'Ligera flexión de codo fija, junta en el centro.', errors: 'Convertirlo en press.' },
  { id: 'pec-deck', name: 'Peck deck (contractora)', group: 'pecho', type: 'aislamiento', equip: 'maquina', cues: 'Aprieta 1s en el centro, controla la vuelta.', errors: 'Usar impulso.' },
  { id: 'pushups', name: 'Flexiones', group: 'pecho', type: 'compuesto', equip: 'peso corporal', cues: 'Cuerpo en línea recta, pecho casi al suelo.', errors: 'Cadera caída, rango parcial.' },
  { id: 'machine-press', name: 'Press en máquina', group: 'pecho', type: 'compuesto', equip: 'maquina', cues: 'Espalda apoyada, empuje controlado.', errors: 'Bloquear codos de golpe.' },
  { id: 'dips-chest', name: 'Fondos para pecho', group: 'pecho', type: 'compuesto', equip: 'peso corporal', cues: 'Torso inclinado adelante, codos abiertos.', errors: 'Bajar demasiado.' },

  // ---------- ESPALDA ----------
  { id: 'deadlift', name: 'Peso muerto', group: 'espalda', type: 'compuesto', equip: 'barra', cues: 'Barra pegada, espalda neutra, empuja el suelo.', errors: 'Redondear la lumbar, tirar con brazos.' },
  { id: 'barbell-row', name: 'Remo con barra', group: 'espalda', type: 'compuesto', equip: 'barra', cues: 'Tronco ~45°, tira al ombligo, aprieta escápulas.', errors: 'Impulso lumbar, encoger hombros.' },
  { id: 'pendlay-row', name: 'Remo Pendlay', group: 'espalda', type: 'compuesto', equip: 'barra', cues: 'Cada rep desde el suelo, explosivo y controlado.', errors: 'Perder la neutralidad lumbar.' },
  { id: 'lat-pulldown', name: 'Jalón al pecho', group: 'espalda', type: 'compuesto', equip: 'polea', cues: 'Lleva la barra al pecho, codos hacia abajo.', errors: 'Balancearse hacia atrás.' },
  { id: 'pullups', name: 'Dominadas', group: 'espalda', type: 'compuesto', equip: 'barra fija', cues: 'Barbilla sobre la barra, controla la bajada.', errors: 'Rango parcial, kipping sin control.' },
  { id: 'seated-row', name: 'Remo sentado en polea', group: 'espalda', type: 'compuesto', equip: 'polea', cues: 'Pecho arriba, tira al abdomen.', errors: 'Redondear la espalda.' },
  { id: 'db-row', name: 'Remo con mancuerna', group: 'espalda', type: 'compuesto', equip: 'mancuernas', cues: 'Apoya rodilla y mano, tira hacia la cadera.', errors: 'Rotar el torso de más.' },
  { id: 'tbar-row', name: 'Remo en T', group: 'espalda', type: 'compuesto', equip: 'barra', cues: 'Pecho apoyado si es posible, aprieta la espalda.', errors: 'Usar demasiada cadera.' },
  { id: 'straight-arm-pulldown', name: 'Pullover en polea', group: 'espalda', type: 'aislamiento', equip: 'polea', cues: 'Brazos rectos, lleva la barra a los muslos.', errors: 'Flexionar los codos.' },
  { id: 'face-pull', name: 'Face pull', group: 'espalda', type: 'aislamiento', equip: 'polea', cues: 'Tira hacia la cara, separa las manos al final.', errors: 'Peso excesivo, impulso.' },

  // ---------- PIERNAS ----------
  { id: 'squat', name: 'Sentadilla', group: 'piernas', type: 'compuesto', equip: 'barra', cues: 'Rompe cadera y rodilla a la vez, baja al paralelo.', errors: 'Rodillas hacia dentro, talones despegados.' },
  { id: 'front-squat', name: 'Sentadilla frontal', group: 'piernas', type: 'compuesto', equip: 'barra', cues: 'Codos altos, torso vertical.', errors: 'Caer el pecho hacia adelante.' },
  { id: 'hack-squat', name: 'Hack squat', group: 'piernas', type: 'compuesto', equip: 'maquina', cues: 'Pies medios, baja profundo y controlado.', errors: 'Rango parcial.' },
  { id: 'leg-press', name: 'Prensa de piernas', group: 'piernas', type: 'compuesto', equip: 'maquina', cues: 'Pies a anchura de hombros, no bloquees rodillas.', errors: 'Despegar la cadera abajo.' },
  { id: 'romanian-deadlift', name: 'Peso muerto rumano', group: 'piernas', type: 'compuesto', equip: 'barra', cues: 'Cadera atrás, espalda neutra, siente el femoral.', errors: 'Redondear lumbar.' },
  { id: 'bulgarian-split', name: 'Sentadilla búlgara', group: 'piernas', type: 'compuesto', equip: 'mancuernas', cues: 'Pie trasero elevado, baja vertical.', errors: 'Paso muy corto.' },
  { id: 'walking-lunge', name: 'Zancadas', group: 'piernas', type: 'compuesto', equip: 'mancuernas', cues: 'Rodilla trasera casi al suelo, torso erguido.', errors: 'Rodilla pasa la punta del pie.' },
  { id: 'leg-curl', name: 'Curl femoral tumbado', group: 'piernas', type: 'aislamiento', equip: 'maquina', cues: 'Controla la fase negativa.', errors: 'Levantar la cadera del banco.' },
  { id: 'seated-leg-curl', name: 'Curl femoral sentado', group: 'piernas', type: 'aislamiento', equip: 'maquina', cues: 'Aprieta el femoral al flexionar.', errors: 'Impulso con la cadera.' },
  { id: 'leg-extension', name: 'Extensión de cuádriceps', group: 'piernas', type: 'aislamiento', equip: 'maquina', cues: 'Aprieta arriba 1s.', errors: 'Impulso, rango parcial.' },
  { id: 'calf-raise', name: 'Elevación de gemelos de pie', group: 'piernas', type: 'aislamiento', equip: 'maquina', cues: 'Rango completo, pausa arriba y abajo.', errors: 'Rebotes rápidos.' },
  { id: 'seated-calf', name: 'Gemelo sentado', group: 'piernas', type: 'aislamiento', equip: 'maquina', cues: 'Estira abajo, contrae arriba.', errors: 'Recorrido corto.' },
  { id: 'hip-thrust', name: 'Hip thrust', group: 'piernas', type: 'compuesto', equip: 'barra', cues: 'Aprieta glúteos arriba, mentón metido.', errors: 'Hiperextender la lumbar.' },
  { id: 'goblet-squat', name: 'Sentadilla goblet', group: 'piernas', type: 'compuesto', equip: 'mancuernas', cues: 'Mancuerna al pecho, baja entre las piernas.', errors: 'Redondear la espalda.' },

  // ---------- HOMBROS ----------
  { id: 'ohp', name: 'Press militar', group: 'hombros', type: 'compuesto', equip: 'barra', cues: 'Core apretado, empuja y mete la cabeza al final.', errors: 'Arquear la lumbar en exceso.' },
  { id: 'db-shoulder-press', name: 'Press de hombro con mancuernas', group: 'hombros', type: 'compuesto', equip: 'mancuernas', cues: 'Codos ligeramente adelante, sin chocar arriba.', errors: 'Rango parcial.' },
  { id: 'arnold-press', name: 'Press Arnold', group: 'hombros', type: 'compuesto', equip: 'mancuernas', cues: 'Rota las mancuernas al subir.', errors: 'Perder control en la rotación.' },
  { id: 'lateral-raise', name: 'Elevaciones laterales', group: 'hombros', type: 'aislamiento', equip: 'mancuernas', cues: 'Sube a la altura del hombro, mínimos impulsos.', errors: 'Balanceo, subir de más.' },
  { id: 'cable-lateral', name: 'Elevación lateral en polea', group: 'hombros', type: 'aislamiento', equip: 'polea', cues: 'Tensión constante, sube controlado.', errors: 'Usar el cuerpo.' },
  { id: 'rear-delt-fly', name: 'Pájaros (deltoide posterior)', group: 'hombros', type: 'aislamiento', equip: 'mancuernas', cues: 'Tronco inclinado, abre con codos fijos.', errors: 'Usar la espalda alta.' },
  { id: 'front-raise', name: 'Elevación frontal', group: 'hombros', type: 'aislamiento', equip: 'mancuernas', cues: 'Sube hasta la altura de los ojos.', errors: 'Balanceo.' },
  { id: 'upright-row', name: 'Remo al mentón', group: 'hombros', type: 'compuesto', equip: 'barra', cues: 'Codos altos, sube a la clavícula.', errors: 'Agarre muy estrecho (pinza el hombro).' },

  // ---------- BRAZOS ----------
  { id: 'barbell-curl', name: 'Curl con barra', group: 'brazos', type: 'aislamiento', equip: 'barra', cues: 'Codos pegados, sin balanceo.', errors: 'Mover los codos adelante.' },
  { id: 'dumbbell-curl', name: 'Curl con mancuernas', group: 'brazos', type: 'aislamiento', equip: 'mancuernas', cues: 'Supina al subir, controla la bajada.', errors: 'Impulso de hombro.' },
  { id: 'hammer-curl', name: 'Curl martillo', group: 'brazos', type: 'aislamiento', equip: 'mancuernas', cues: 'Agarre neutro, controla la bajada.', errors: 'Impulso.' },
  { id: 'preacher-curl', name: 'Curl predicador', group: 'brazos', type: 'aislamiento', equip: 'maquina', cues: 'Brazos apoyados, estira abajo del todo.', errors: 'No completar el rango.' },
  { id: 'cable-curl', name: 'Curl en polea', group: 'brazos', type: 'aislamiento', equip: 'polea', cues: 'Tensión constante, aprieta arriba.', errors: 'Adelantar los codos.' },
  { id: 'triceps-pushdown', name: 'Extensión de tríceps en polea', group: 'brazos', type: 'aislamiento', equip: 'polea', cues: 'Codos fijos al costado, extiende del todo.', errors: 'Abrir los codos.' },
  { id: 'rope-pushdown', name: 'Extensión con cuerda', group: 'brazos', type: 'aislamiento', equip: 'polea', cues: 'Separa la cuerda al final.', errors: 'Usar el peso del cuerpo.' },
  { id: 'skullcrusher', name: 'Press francés', group: 'brazos', type: 'aislamiento', equip: 'barra', cues: 'Codos apuntando al techo, baja a la frente.', errors: 'Mover los hombros.' },
  { id: 'overhead-triceps', name: 'Extensión de tríceps sobre la cabeza', group: 'brazos', type: 'aislamiento', equip: 'mancuernas', cues: 'Codos cerca de la cabeza, estira arriba.', errors: 'Abrir los codos.' },
  { id: 'dips', name: 'Fondos', group: 'brazos', type: 'compuesto', equip: 'peso corporal', cues: 'Torso vertical para tríceps, controla la bajada.', errors: 'Bajar demasiado.' },

  // ---------- CORE ----------
  { id: 'plank', name: 'Plancha', group: 'core', type: 'aislamiento', equip: 'peso corporal', cues: 'Cuerpo en línea, aprieta glúteos y abdomen.', errors: 'Cadera caída o muy alta.' },
  { id: 'hanging-leg-raise', name: 'Elevación de piernas colgado', group: 'core', type: 'aislamiento', equip: 'barra fija', cues: 'Sube con el abdomen, sin balanceo.', errors: 'Usar impulso.' },
  { id: 'cable-crunch', name: 'Crunch en polea', group: 'core', type: 'aislamiento', equip: 'polea', cues: 'Redondea la columna, aprieta abajo.', errors: 'Tirar con los brazos.' },
  { id: 'russian-twist', name: 'Giro ruso', group: 'core', type: 'aislamiento', equip: 'peso corporal', cues: 'Gira desde el tronco, controla el ritmo.', errors: 'Mover solo los brazos.' },
  { id: 'ab-wheel', name: 'Rueda abdominal', group: 'core', type: 'aislamiento', equip: 'peso corporal', cues: 'Rueda sin arquear la lumbar.', errors: 'Dejar caer la cadera.' },
  { id: 'leg-raise', name: 'Elevación de piernas en suelo', group: 'core', type: 'aislamiento', equip: 'peso corporal', cues: 'Lumbar pegada al suelo, baja controlado.', errors: 'Despegar la lumbar.' },
  { id: 'mountain-climber', name: 'Escaladores', group: 'core', type: 'compuesto', equip: 'peso corporal', cues: 'Cadera baja, ritmo constante.', errors: 'Subir la cadera.' },

  // ---------- CARDIO ----------
  { id: 'treadmill', name: 'Cinta / carrera', group: 'cardio', type: 'compuesto', equip: 'cardio', cues: 'Ritmo sostenible, postura erguida.', errors: 'Agarrarse a las barras.' },
  { id: 'incline-walk', name: 'Caminata inclinada', group: 'cardio', type: 'compuesto', equip: 'cardio', cues: 'Inclinación 8-12%, ritmo cómodo.', errors: 'Colgarte hacia delante.' },
  { id: 'rowing', name: 'Remo (máquina cardio)', group: 'cardio', type: 'compuesto', equip: 'cardio', cues: 'Piernas, cadera y brazos en ese orden.', errors: 'Tirar solo con brazos.' },
  { id: 'cycling', name: 'Bicicleta estática', group: 'cardio', type: 'compuesto', equip: 'cardio', cues: 'Resistencia media, cadencia estable.', errors: 'Sillín mal ajustado.' },
  { id: 'stairmaster', name: 'Escaladora', group: 'cardio', type: 'compuesto', equip: 'cardio', cues: 'Postura erguida, no te apoyes.', errors: 'Cargar el peso en los brazos.' },
]

export const EXERCISES_BY_GROUP = EXERCISES.reduce((acc, ex) => {
  ;(acc[ex.group] ||= []).push(ex)
  return acc
}, {})

export function getExercise(id) {
  return EXERCISES.find((e) => e.id === id)
}

// Alternativas: mismo grupo muscular y tipo, distinto ejercicio
export function findAlternatives(id, max = 3) {
  const ex = getExercise(id)
  if (!ex) return []
  return EXERCISES.filter((e) => e.group === ex.group && e.id !== id && e.type === ex.type).slice(0, max)
}
