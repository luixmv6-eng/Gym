import { useState, useMemo, useEffect } from 'react'
import { useStore, todayStr } from '../store/useStore'
import { FOODS, foodKcal, MEAL_TEMPLATES } from '../data/foods'
import { searchFoods } from '../services/nutritionApi'
import { Card, ProgressBar, Modal, Empty } from '../components/ui'
import { Plus, Search, Trash2, Sparkles, UtensilsCrossed, ShoppingCart, Loader2, Globe } from 'lucide-react'

const MEALS = ['desayuno', 'almuerzo', 'cena', 'snack']

export default function Nutrition() {
  const { metabolic, foodLog, addFood, removeFood, profile } = useStore()
  const [tab, setTab] = useState('diario')
  const today = todayStr()
  const entries = foodLog[today] || []

  const totals = entries.reduce(
    (a, f) => ({ p: a.p + f.p, c: a.c + f.c, f: a.f + f.f, kcal: a.kcal + f.kcal }),
    { p: 0, c: 0, f: 0, kcal: 0 }
  )
  const goal = metabolic?.macros || { protein: 0, carbs: 0, fat: 0 }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Tab active={tab === 'diario'} onClick={() => setTab('diario')}>
          Diario
        </Tab>
        <Tab active={tab === 'plan'} onClick={() => setTab('plan')}>
          Plan de comidas
        </Tab>
      </div>

      {tab === 'diario' ? (
        <Diario
          entries={entries}
          totals={totals}
          goal={goal}
          calories={metabolic?.calories}
          onAdd={(entry) => addFood(today, entry)}
          onRemove={(id) => removeFood(today, id)}
        />
      ) : (
        <PlanComidas calories={metabolic?.calories} goal={goal} />
      )}
    </div>
  )
}

function Diario({ entries, totals, goal, calories, onAdd, onRemove }) {
  const [open, setOpen] = useState(false)

  const remaining = Math.max(0, (calories || 0) - Math.round(totals.kcal))

  return (
    <>
      <Card>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase text-muted">Consumido hoy</p>
            <p className="font-display text-3xl text-primary tabular">
              {Math.round(totals.kcal)}
              <span className="text-base text-muted"> / {calories} kcal</span>
            </p>
          </div>
          <span className="text-sm text-muted tabular">Quedan {remaining} kcal</span>
        </div>
        <div className="flex flex-col gap-3">
          <MacroRow label="Proteína" value={totals.p} max={goal.protein} color="#22C55E" />
          <MacroRow label="Carbohidratos" value={totals.c} max={goal.carbs} color="#3B82F6" />
          <MacroRow label="Grasas" value={totals.f} max={goal.fat} color="#EAB308" />
        </div>
      </Card>

      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="w-5 h-5" /> Añadir alimento
      </button>

      {entries.length === 0 ? (
        <Empty icon={UtensilsCrossed} title="Aún no registras comidas hoy" hint="Añade lo que comes para seguir tus macros." />
      ) : (
        MEALS.map((meal) => {
          const group = entries.filter((e) => e.meal === meal)
          if (!group.length) return null
          return (
            <Card key={meal}>
              <p className="text-xs uppercase text-muted mb-2 capitalize">{meal}</p>
              <div className="flex flex-col divide-y divide-line">
                {group.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted tabular">
                        {f.qty}× · P{f.p} C{f.c} G{f.f} · {f.kcal} kcal
                      </div>
                    </div>
                    <button onClick={() => onRemove(f.id)} className="p-2 text-slate-500 hover:text-red-400" aria-label="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )
        })
      )}

      <AddFoodModal open={open} onClose={() => setOpen(false)} onAdd={onAdd} />
    </>
  )
}

function AddFoodModal({ open, onClose, onAdd }) {
  const [q, setQ] = useState('')
  const [meal, setMeal] = useState('desayuno')
  const [sel, setSel] = useState(null)
  const [qty, setQty] = useState(1)
  const [remote, setRemote] = useState([])
  const [searching, setSearching] = useState(false)

  const local = useMemo(
    () => FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6),
    [q]
  )

  // Búsqueda en base mundial (Open Food Facts) con debounce
  useEffect(() => {
    if (q.trim().length < 2) {
      setRemote([])
      return
    }
    const ctrl = new AbortController()
    setSearching(true)
    const t = setTimeout(async () => {
      const res = await searchFoods(q, { signal: ctrl.signal })
      setRemote(res)
      setSearching(false)
    }, 350)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const kcalOf = (f) => f.kcal ?? foodKcal(f)

  const add = () => {
    if (!sel) return
    onAdd({
      foodId: sel.id,
      name: `${sel.name} (${qty}× ${sel.unit})`,
      qty,
      meal,
      p: Math.round(sel.p * qty),
      c: Math.round(sel.c * qty),
      f: Math.round(sel.f * qty),
      kcal: Math.round(kcalOf(sel) * qty),
    })
    setSel(null)
    setQ('')
    setQty(1)
    setRemote([])
    onClose()
  }

  const FoodRow = ({ f }) => (
    <button onClick={() => setSel(f)} className="w-full text-left px-3 py-2.5 rounded-xl bg-bg-soft hover:bg-line/60 transition-colors">
      <div className="text-sm font-medium truncate">{f.name}</div>
      <div className="text-xs text-muted tabular">
        {f.unit} · {kcalOf(f)} kcal · P{f.p} C{f.c} G{f.f}
      </div>
    </button>
  )

  return (
    <Modal open={open} onClose={onClose} title="Añadir alimento">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {MEALS.map((m) => (
            <button
              key={m}
              onClick={() => setMeal(m)}
              className={`chip capitalize ${meal === m ? 'border-primary text-primary bg-primary/10' : 'border-line text-slate-300'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-11" placeholder="Busca cualquier alimento o producto..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>

        {!sel ? (
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
            {local.length > 0 && (
              <>
                <p className="text-[11px] uppercase text-muted px-1 pt-1">Alimentos base</p>
                {local.map((f) => (
                  <FoodRow key={f.id} f={f} />
                ))}
              </>
            )}
            {q.trim().length >= 2 && (
              <div className="flex items-center gap-1.5 text-[11px] uppercase text-muted px-1 pt-2">
                <Globe className="w-3 h-3" /> Base mundial
                {searching && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </div>
            )}
            {remote.map((f) => (
              <FoodRow key={f.id} f={f} />
            ))}
            {q.trim().length >= 2 && !searching && remote.length === 0 && local.length === 0 && (
              <p className="text-sm text-muted px-1 py-3">Sin resultados. Prueba otro término.</p>
            )}
          </div>
        ) : (
          <div className="card p-3 flex flex-col gap-3">
            <div>
              <div className="font-medium">{sel.name}</div>
              <div className="text-xs text-muted">{sel.unit}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Cantidad</span>
              <button className="btn-ghost px-3 py-1" onClick={() => setQty((q) => Math.max(0.5, q - 0.5))}>−</button>
              <span className="tabular w-10 text-center">{qty}×</span>
              <button className="btn-ghost px-3 py-1" onClick={() => setQty((q) => q + 0.5)}>+</button>
            </div>
            <div className="text-sm text-muted tabular">
              Total: {Math.round(kcalOf(sel) * qty)} kcal · P{Math.round(sel.p * qty)} C
              {Math.round(sel.c * qty)} G{Math.round(sel.f * qty)}
            </div>
            <button className="btn-accent" onClick={add}>
              Añadir a {meal}
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function PlanComidas({ calories, goal }) {
  const plan = useMemo(() => buildPlan(), [])
  const [showList, setShowList] = useState(false)

  return (
    <>
      <Card className="bg-bg-soft flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-slate-200">
          Plan generado para <b>{calories} kcal</b> · P{goal.protein} C{goal.carbs} G{goal.fat}
        </p>
      </Card>

      {plan.map((meal, i) => {
        const t = meal.items.reduce(
          (a, [food, q]) => {
            const f = FOODS.find((x) => x.id === food)
            return { p: a.p + f.p * q, c: a.c + f.c * q, f: a.f + f.f * q, kcal: a.kcal + foodKcal(f) * q }
          },
          { p: 0, c: 0, f: 0, kcal: 0 }
        )
        return (
          <Card key={i}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs uppercase text-muted capitalize">{meal.tag}</p>
                <h3 className="text-lg uppercase font-display">{meal.name}</h3>
              </div>
              <span className="chip border-line text-slate-300 tabular" style={{ cursor: 'default' }}>
                {Math.round(t.kcal)} kcal
              </span>
            </div>
            <ul className="text-sm text-slate-300 flex flex-col gap-1">
              {meal.items.map(([food, q], j) => {
                const f = FOODS.find((x) => x.id === food)
                return (
                  <li key={j} className="flex justify-between">
                    <span>{f.name}</span>
                    <span className="text-muted tabular">{q}× {f.unit}</span>
                  </li>
                )
              })}
            </ul>
            <div className="text-xs text-muted mt-2 tabular">
              P{Math.round(t.p)} · C{Math.round(t.c)} · G{Math.round(t.f)} · ⏱ {meal.time} min
            </div>
          </Card>
        )
      })}

      <button className="btn-ghost" onClick={() => setShowList(true)}>
        <ShoppingCart className="w-5 h-5" /> Ver lista de compra
      </button>

      <ShoppingModal open={showList} onClose={() => setShowList(false)} plan={plan} />
    </>
  )
}

function buildPlan() {
  const pick = (tag) => {
    const opts = MEAL_TEMPLATES.filter((m) => m.tag === tag)
    return opts[Math.floor(Math.random() * opts.length)]
  }
  return [pick('desayuno'), pick('snack'), pick('almuerzo'), pick('cena')]
}

function ShoppingModal({ open, onClose, plan }) {
  const list = {}
  plan.forEach((meal) =>
    meal.items.forEach(([food, q]) => {
      list[food] = (list[food] || 0) + q
    })
  )
  return (
    <Modal open={open} onClose={onClose} title="Lista de compra">
      <ul className="flex flex-col gap-2">
        {Object.entries(list).map(([food, q]) => {
          const f = FOODS.find((x) => x.id === food)
          return (
            <li key={food} className="flex items-center justify-between py-1.5 border-b border-line">
              <span className="text-sm">{f.name}</span>
              <span className="text-sm text-muted tabular">
                {q.toFixed(1)} × {f.unit}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-muted mt-3">
        Cantidades para un día. Multiplica por los días que quieras preparar.
      </p>
    </Modal>
  )
}

function MacroRow({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="tabular text-muted">
          {Math.round(value)}/{max}g
        </span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
    </div>
  )
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-primary text-slate-900' : 'bg-bg-soft text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
