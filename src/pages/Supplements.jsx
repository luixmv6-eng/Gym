import { useState } from 'react'
import { useStore } from '../store/useStore'
import { SUPPLEMENTS, getSupplement } from '../data/supplements'
import { GOALS } from '../data/content'
import { Card, Modal } from '../components/ui'
import { Pill, AlertTriangle, Clock, Bell, BellOff, Calculator, DollarSign } from 'lucide-react'

export default function Supplements() {
  const { profile, activeSupplements, toggleSupplement, updateSupplement } = useStore()
  const [calc, setCalc] = useState(null) // supplement id abierto en calculadora

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl uppercase">Suplementos</h1>
      <p className="text-sm text-muted -mt-2">
        Dosis calculadas según tu peso ({profile?.weight}kg) y objetivo ({GOALS[profile?.goal]?.label}).
      </p>

      <div className="grid gap-3">
        {SUPPLEMENTS.map((s) => {
          const active = activeSupplements.find((a) => a.id === s.id)
          return (
            <Card key={s.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-xs text-muted truncate">{s.role}</div>
              </div>
              <button className="btn-ghost text-sm py-2 px-3" onClick={() => setCalc(s.id)}>
                <Calculator className="w-4 h-4" />
              </button>
              <button
                className={`btn text-sm py-2 px-3 ${active ? 'bg-accent text-slate-900' : 'bg-bg-soft border border-line text-slate-300'}`}
                onClick={() => toggleSupplement(s.id, 1)}
              >
                {active ? 'Activo' : 'Añadir'}
              </button>
            </Card>
          )
        })}
      </div>

      {activeSupplements.length > 0 && (
        <>
          <h2 className="text-xl uppercase mt-2">Mis suplementos activos</h2>
          {activeSupplements.map((a) => {
            const s = getSupplement(a.id)
            const d = s.dose({ weight: profile.weight, goal: profile.goal, doses: a.doses })
            return (
              <Card key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm text-primary tabular">
                    {d.amount} {d.unit}/día
                  </div>
                </div>
                <button
                  className={`p-2.5 rounded-xl ${a.reminder ? 'bg-primary/15 text-primary' : 'bg-bg-soft text-slate-400'}`}
                  onClick={() => updateSupplement(a.id, { reminder: !a.reminder })}
                  aria-label="Recordatorio"
                >
                  {a.reminder ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
              </Card>
            )
          })}
        </>
      )}

      <CalcModal id={calc} onClose={() => setCalc(null)} profile={profile} />
    </div>
  )
}

function CalcModal({ id, onClose, profile }) {
  const [doses, setDoses] = useState(1)
  const [weight, setWeight] = useState(profile?.weight || 75)
  const [goal, setGoal] = useState(profile?.goal || 'masa')
  if (!id) return null
  const s = getSupplement(id)
  const d = s.dose({ weight: +weight, goal, doses: +doses })

  return (
    <Modal open={!!id} onClose={onClose} title={s.name}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Peso (kg)</label>
            <input type="number" className="input" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <label className="label">Objetivo</label>
            <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
              {Object.entries(GOALS).map(([v, g]) => (
                <option key={v} value={v}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Dosis por día: {doses}</label>
          <input type="range" min="1" max="3" value={doses} onChange={(e) => setDoses(e.target.value)} className="w-full accent-primary" />
        </div>

        {/* Resultado */}
        <div className="card p-4 bg-bg-soft flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">Dosis diaria</span>
            <span className="font-display text-2xl text-primary tabular">
              {d.amount} {d.unit}
            </span>
          </div>
          <Row icon={Pill} text={d.perDose} />
          <Row icon={Calculator} text={`Dilución: ${d.dilution}`} />
          <div className="flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-muted">Horarios: </span>
              {d.timing.join(' · ')}
            </div>
          </div>
        </div>

        {/* Advertencias */}
        {s.sideEffects.length > 0 && (
          <Warn title="Efectos secundarios" items={s.sideEffects} color="#F97316" />
        )}
        {s.contra.length > 0 && <Warn title="Contraindicaciones" items={s.contra} color="#EF4444" />}

        <div className="flex items-center gap-1.5 text-sm text-muted">
          <DollarSign className="w-4 h-4" /> Costo aprox: ~${s.costMonth} USD/mes
        </div>
      </div>
    </Modal>
  )
}

function Row({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-200">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

function Warn({ title, items, color }) {
  return (
    <div className="flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
      <div>
        <p className="text-sm font-semibold" style={{ color }}>
          {title}
        </p>
        <ul className="text-sm text-slate-300 list-disc list-inside">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
