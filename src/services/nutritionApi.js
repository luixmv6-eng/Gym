// Búsqueda de alimentos en USDA FoodData Central (permite CORS desde el navegador).
// Gratis. Con DEMO_KEY funciona pero con límite bajo; añade tu propia key en .env
// (VITE_USDA_API_KEY) desde https://fdc.nal.usda.gov/api-key-signup.html
// Normaliza los macros por 100g. Si falla / offline, devuelve [].

const KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY'
const SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'

// nutrientNumber en USDA: 203 proteína, 204 grasa, 205 carbohidratos, 208 energía (kcal)
function nutrient(food, number) {
  const n = (food.foodNutrients || []).find((x) => x.nutrientNumber === number)
  return n && isFinite(n.value) ? n.value : 0
}

function normalize(food) {
  const p = nutrient(food, '203')
  const c = nutrient(food, '205')
  const f = nutrient(food, '204')
  let kcal = nutrient(food, '208')
  if (!kcal) kcal = Math.round(p * 4 + c * 4 + f * 9)
  const name = (food.description || '').trim()
  if (!name || (!p && !c && !f && !kcal)) return null
  const brand = (food.brandOwner || food.brandName || '').trim()
  const label = brand ? `${titleCase(name)} · ${titleCase(brand)}` : titleCase(name)
  return {
    id: 'usda-' + food.fdcId,
    name: label,
    unit: '100g',
    p: Math.round(p * 10) / 10,
    c: Math.round(c * 10) / 10,
    f: Math.round(f * 10) / 10,
    kcal: Math.round(kcal),
    source: 'usda',
  }
}

function titleCase(s) {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const cache = new Map()

export async function searchFoods(query, { signal } = {}) {
  const q = query.trim()
  if (q.length < 2 || !navigator.onLine) return []
  if (cache.has(q)) return cache.get(q)

  const url =
    `${SEARCH_URL}?query=${encodeURIComponent(q)}&pageSize=20&api_key=${KEY}` +
    `&dataType=Foundation,SR%20Legacy,Branded`

  try {
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error('USDA ' + res.status)
    const data = await res.json()
    const results = (data.foods || [])
      .map(normalize)
      .filter(Boolean)
      .sort((a, b) => (b.p > 0) - (a.p > 0) || a.name.length - b.name.length)
      .slice(0, 12)
    cache.set(q, results)
    return results
  } catch (e) {
    if (e.name !== 'AbortError') console.warn('[nutritionApi]', e.message)
    return []
  }
}
