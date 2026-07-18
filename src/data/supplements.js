// Calculadora de suplementos: cada uno define cómo calcular su dosis.
// dose(ctx) => { amount, unit, perDose, dilution, timing[], costMonth }

export const SUPPLEMENTS = [
  {
    id: 'proteina',
    name: 'Proteína (Whey/Vegana)',
    role: 'Síntesis proteica muscular',
    sideEffects: ['Molestias digestivas si excede tolerancia a lactosa'],
    contra: ['Intolerancia severa a lactosa (usar aislado/vegana)'],
    costMonth: 25,
    dose: ({ weight, goal, doses }) => {
      const perKg = goal === 'masa' ? 2.0 : goal === 'definicion' || goal === 'perdida' ? 2.2 : 1.6
      let total = weight * perKg
      if (weight > 90) total -= 0.2 * weight
      // La proteína del suplemento cubre ~40% del total; el resto de la dieta
      const fromSupp = Math.round(total * 0.4)
      return {
        amount: fromSupp,
        unit: 'g',
        perDose: `${Math.round(fromSupp / doses)}g × ${doses}`,
        dilution: '1 scoop en 250-300ml de agua o leche',
        timing: ['Post-entreno', 'Desayuno', 'Entre comidas'].slice(0, doses),
      }
    },
  },
  {
    id: 'creatina',
    name: 'Creatina monohidratada',
    role: 'ATP muscular, fuerza y volumen',
    sideEffects: ['Retención de agua (1-2kg)', 'Molestias GI en dosis altas'],
    contra: ['Problemas renales', 'Deshidratación'],
    costMonth: 8,
    dose: () => ({
      amount: 5,
      unit: 'g',
      perDose: '5g × 1 (constante todos los días)',
      dilution: '5g en 150-200ml de agua',
      timing: ['Cualquier momento del día (requiere 2L+ de agua)'],
    }),
  },
  {
    id: 'preentreno',
    name: 'Pre-entreno',
    role: 'Energía, bomba y focus',
    sideEffects: ['Insomnio si es tarde', 'Hormigueo (beta-alanina)'],
    contra: ['Hipertensión', 'Sensibilidad a estimulantes'],
    costMonth: 20,
    dose: () => ({
      amount: 1,
      unit: 'dosis',
      perDose: 'Cafeína 150-300mg + Citrulina 6-8g + Beta-alanina 3-5g',
      dilution: '1 scoop en 300ml de agua',
      timing: ['30-60 min antes de entrenar (no después de las 16:00)'],
    }),
  },
  {
    id: 'bcaa',
    name: 'BCAAs (2:1:1)',
    role: 'Anti-catabolismo, síntesis proteica',
    sideEffects: ['Innecesarios si la ingesta proteica es alta'],
    contra: [],
    costMonth: 15,
    dose: ({ doses }) => ({
      amount: Math.min(20, 8 * doses),
      unit: 'g',
      perDose: `${Math.min(10, 8)}g × ${doses}`,
      dilution: 'En 400-500ml de agua, durante o post-entreno',
      timing: ['Post-entreno', 'Mañana'].slice(0, doses),
    }),
  },
  {
    id: 'multivitaminico',
    name: 'Multivitamínico',
    role: 'Cobertura nutricional',
    sideEffects: ['Orina amarilla (riboflavina)'],
    contra: [],
    costMonth: 10,
    dose: () => ({
      amount: 1,
      unit: 'comprimido',
      perDose: '1 al día',
      dilution: 'Con el desayuno (mejor absorción con alimento)',
      timing: ['Desayuno'],
    }),
  },
  {
    id: 'vitd3',
    name: 'Vitamina D3',
    role: 'Absorción de calcio, inmunidad, testosterona',
    sideEffects: ['Toxicidad solo en dosis muy altas y prolongadas'],
    contra: ['Hipercalcemia'],
    costMonth: 6,
    dose: () => ({
      amount: 2000,
      unit: 'IU',
      perDose: '1000-4000 IU/día según déficit',
      dilution: 'Con una comida que contenga grasa',
      timing: ['Desayuno'],
    }),
  },
  {
    id: 'omega3',
    name: 'Omega 3 (EPA+DHA)',
    role: 'Antiinflamatorio, salud cardiovascular y cerebral',
    sideEffects: ['Regusto a pescado', 'Molestias GI leves'],
    contra: ['Anticoagulantes (consultar médico)'],
    costMonth: 12,
    dose: ({ doses }) => ({
      amount: Math.min(3, doses),
      unit: 'g EPA+DHA',
      perDose: `1g × ${Math.min(3, doses)}`,
      dilution: 'Con las comidas principales',
      timing: ['Desayuno', 'Almuerzo', 'Cena'].slice(0, Math.min(3, doses)),
    }),
  },
  {
    id: 'cafeina',
    name: 'Cafeína',
    role: 'Energía, focus, resistencia',
    sideEffects: ['Nerviosismo', 'Insomnio si es tarde'],
    contra: ['Arritmias', 'Ansiedad'],
    costMonth: 5,
    dose: ({ weight }) => ({
      amount: Math.round(weight * 3),
      unit: 'mg',
      perDose: `${Math.round(weight * 3)}mg (3mg/kg)`,
      dilution: 'Comprimido o en agua',
      timing: ['30-60 min antes de entrenar'],
    }),
  },
  {
    id: 'magnesio',
    name: 'Magnesio',
    role: 'Recuperación, sueño, relajación muscular',
    sideEffects: ['Efecto laxante en dosis altas'],
    contra: ['Insuficiencia renal'],
    costMonth: 7,
    dose: () => ({
      amount: 400,
      unit: 'mg',
      perDose: '300-500mg',
      dilution: 'Con agua, no junto al calcio',
      timing: ['Antes de dormir'],
    }),
  },
  {
    id: 'glutamina',
    name: 'Glutamina',
    role: 'Recuperación intestinal e inmune',
    sideEffects: ['Generalmente bien tolerada'],
    contra: [],
    costMonth: 10,
    dose: () => ({
      amount: 5,
      unit: 'g',
      perDose: '5g',
      dilution: 'En agua post-entreno',
      timing: ['Post-entreno'],
    }),
  },
]

export function getSupplement(id) {
  return SUPPLEMENTS.find((s) => s.id === id)
}
