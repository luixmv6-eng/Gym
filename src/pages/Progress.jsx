import { useState, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useStore } from '../store/useStore'
import { estimate1RM } from '../utils/calculations'
import { Card, Modal, Empty, SectionTitle } from '../components/ui'
import { Plus, Camera, Trophy, TrendingUp, Weight, Award } from 'lucide-react'

export default function Progress() {
  const { measurements, profile, workoutLog, photos, addMeasurement, addPhoto } = useStore()
  const [openM, setOpenM] = useState(false)
  const fileRef = useRef(null)

  const weightData = measurements.map((m) => ({
    date: m.date.slice(5),
    peso: m.weight,
  }))
  const first = measurements[0]
  const last = measurements[measurements.length - 1]
  const change = last && first ? +(last.weight - first.weight).toFixed(1) : 0

  // Progreso de fuerza: mejor 1RM por ejercicio compuesto principal
  const strength = computeStrength(workoutLog)
  const badges = computeBadges({ workoutLog, measurements, profile })

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => addPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-5 stagger">
      <h1 className="text-2xl uppercase">Progreso</h1>

      {/* Peso */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase text-muted">Peso actual</p>
            <p className="font-display text-2xl text-primary tabular">
              {last?.weight ?? '—'} kg
              {change !== 0 && (
                <span className={`text-sm ml-2 ${change < 0 ? 'text-accent' : 'text-secondary'}`}>
                  {change > 0 ? '+' : ''}
                  {change}kg
                </span>
              )}
            </p>
          </div>
          <button className="btn-ghost text-sm py-2" onClick={() => setOpenM(true)}>
            <Plus className="w-4 h-4" /> Registrar
          </button>
        </div>
        {weightData.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #374151', borderRadius: 12, color: '#F8FAFC' }}
              />
              {profile?.targetWeight && (
                <Line type="monotone" dataKey={() => profile.targetWeight} stroke="#22C55E" strokeDasharray="4 4" dot={false} name="Objetivo" />
              )}
              <Line type="monotone" dataKey="peso" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: '#F97316' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty icon={Weight} title="Registra tu peso para ver la evolución" />
        )}
      </Card>

      {/* Medidas */}
      {last && (
        <Card>
          <SectionTitle>Medidas corporales</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Pecho', 'chest'],
              ['Cintura', 'waist'],
              ['Cadera', 'hip'],
              ['Brazo', 'arm'],
              ['Muslo', 'thigh'],
              ['% Grasa', 'bodyFat'],
            ].map(([label, key]) => (
              <div key={key} className="text-center card p-2 bg-bg-soft">
                <div className="text-[11px] text-muted">{label}</div>
                <div className="font-display text-lg tabular">
                  {last[key] ?? '—'}
                  {last[key] && <span className="text-xs text-muted">{key === 'bodyFat' ? '%' : 'cm'}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fuerza */}
      <Card>
        <SectionTitle>Fuerza (1RM estimado)</SectionTitle>
        {strength.length ? (
          <div className="flex flex-col gap-2">
            {strength.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <span className="text-sm text-slate-200">{s.name}</span>
                <span className="font-display text-primary tabular">{s.oneRM}kg</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={TrendingUp} title="Completa entrenamientos para ver tu progreso de fuerza" />
        )}
      </Card>

      {/* Fotos */}
      <Card>
        <SectionTitle
          right={
            <button className="btn-ghost text-sm py-2" onClick={() => fileRef.current?.click()}>
              <Camera className="w-4 h-4" /> Añadir
            </button>
          }
        >
          Fotos de progreso
        </SectionTitle>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        {photos.length ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <div key={i} className="shrink-0 relative">
                <img src={p.dataUrl} alt={`Progreso ${p.date}`} className="w-28 h-36 object-cover rounded-xl" />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-1.5 py-0.5 rounded tabular">
                  {p.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={Camera} title="Sube tu primera foto" hint="Compara tu evolución mes a mes." />
        )}
      </Card>

      {/* Logros */}
      <Card>
        <SectionTitle>Logros</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`card p-3 flex items-center gap-2 ${b.earned ? 'border-primary/40' : 'opacity-40'}`}
            >
              <Award className="w-5 h-5" style={{ color: b.earned ? '#F97316' : '#64748B' }} />
              <div>
                <div className="text-sm font-semibold">{b.name}</div>
                <div className="text-[11px] text-muted">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <MeasureModal open={openM} onClose={() => setOpenM(false)} last={last} onSave={addMeasurement} />
    </div>
  )
}

function computeStrength(log) {
  const best = {}
  log.forEach((w) =>
    w.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        const rm = estimate1RM(s.weight, s.reps)
        if (!best[ex.name] || rm > best[ex.name]) best[ex.name] = rm
      })
    })
  )
  return Object.entries(best)
    .map(([name, oneRM]) => ({ name, oneRM }))
    .sort((a, b) => b.oneRM - a.oneRM)
    .slice(0, 5)
}

function computeBadges({ workoutLog, measurements, profile }) {
  const count = workoutLog.length
  const uniqueDays = new Set(workoutLog.map((w) => w.date)).size
  const first = measurements[0]?.weight
  const last = measurements[measurements.length - 1]?.weight
  const weightChange = first && last ? Math.abs(last - first) : 0
  return [
    { name: 'Primer paso', desc: 'Completa 1 sesión', earned: count >= 1 },
    { name: '7-Day Warrior', desc: '7 sesiones', earned: count >= 7 },
    { name: '100 Workouts', desc: '100 sesiones', earned: count >= 100 },
    { name: 'Constancia', desc: '30 días activos', earned: uniqueDays >= 30 },
    { name: 'Transformación', desc: '±5kg de cambio', earned: weightChange >= 5 },
    { name: 'Meta fijada', desc: 'Objetivo definido', earned: !!profile?.targetWeight },
  ]
}

function MeasureModal({ open, onClose, last, onSave }) {
  const [m, setM] = useState({})
  const fields = [
    ['weight', 'Peso (kg)'],
    ['chest', 'Pecho (cm)'],
    ['waist', 'Cintura (cm)'],
    ['hip', 'Cadera (cm)'],
    ['arm', 'Brazo (cm)'],
    ['thigh', 'Muslo (cm)'],
    ['bodyFat', '% Grasa'],
  ]
  return (
    <Modal open={open} onClose={onClose} title="Registrar medidas">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input
              type="number"
              inputMode="decimal"
              className="input"
              placeholder={last?.[key] ?? ''}
              value={m[key] ?? ''}
              onChange={(e) => setM((s) => ({ ...s, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <button
        className="btn-primary w-full mt-4"
        onClick={() => {
          const clean = {}
          Object.entries(m).forEach(([k, v]) => v !== '' && (clean[k] = +v))
          // conserva medidas previas no editadas
          onSave({ ...Object.fromEntries(fields.map(([k]) => [k, last?.[k] ?? null])), ...clean })
          onClose()
        }}
      >
        Guardar medidas
      </button>
    </Modal>
  )
}
