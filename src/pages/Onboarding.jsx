import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { buildMetabolicProfile } from '../utils/calculations'
import { bmiCategory } from '../utils/calculations'
import { GOALS } from '../data/content'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const STEPS = ['Sobre ti', 'Medidas', 'Experiencia', 'Objetivo', 'Salud', 'Resumen']

const empty = {
  name: '',
  age: 25,
  sex: 'male',
  weight: 75,
  height: 175,
  chest: '',
  waist: '',
  hip: '',
  arm: '',
  thigh: '',
  bodyFat: '',
  experience: 'principiante',
  hasGym: true,
  goal: 'masa',
  targetWeight: '',
  daysPerWeek: 4,
  sessionMin: 60,
  injuries: '',
  diet: 'omnivoro',
  allergies: '',
}

export default function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding)
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [f, setF] = useState(empty)
  const up = (patch) => setF((s) => ({ ...s, ...patch }))

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const finish = () => {
    complete({
      ...f,
      age: +f.age,
      weight: +f.weight,
      height: +f.height,
      daysPerWeek: +f.daysPerWeek,
      chest: f.chest ? +f.chest : null,
      waist: f.waist ? +f.waist : null,
      hip: f.hip ? +f.hip : null,
      arm: f.arm ? +f.arm : null,
      thigh: f.thigh ? +f.thigh : null,
      bodyFat: f.bodyFat ? +f.bodyFat : null,
      targetWeight: f.targetWeight ? +f.targetWeight : null,
    })
    nav('/')
  }

  const preview = buildMetabolicProfile({
    weight: +f.weight,
    height: +f.height,
    age: +f.age,
    sex: f.sex,
    daysPerWeek: +f.daysPerWeek,
    goal: f.goal,
  })
  const cat = bmiCategory(preview.bmi)

  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto px-5 py-6">
      {/* Progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">
            Paso {step + 1} de {STEPS.length}
          </span>
          <span className="text-sm font-semibold text-primary">{STEPS[step]}</span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-soft overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 animate-fade-up">
        {step === 0 && (
          <Section title="Cuéntanos sobre ti">
            <Field label="¿Cómo te llamas?">
              <input
                className="input"
                value={f.name}
                onChange={(e) => up({ name: e.target.value })}
                placeholder="Tu nombre"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Edad">
                <input type="number" inputMode="numeric" className="input" value={f.age} onChange={(e) => up({ age: e.target.value })} />
              </Field>
              <Field label="Sexo">
                <select className="input" value={f.sex} onChange={(e) => up({ sex: e.target.value })}>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </Field>
            </div>
          </Section>
        )}

        {step === 1 && (
          <Section title="Tus medidas" hint="El peso y la altura son clave para los cálculos.">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peso (kg) *">
                <input type="number" inputMode="decimal" className="input" value={f.weight} onChange={(e) => up({ weight: e.target.value })} />
              </Field>
              <Field label="Altura (cm) *">
                <input type="number" inputMode="numeric" className="input" value={f.height} onChange={(e) => up({ height: e.target.value })} />
              </Field>
              <Field label="Pecho (cm)">
                <input type="number" className="input" value={f.chest} onChange={(e) => up({ chest: e.target.value })} placeholder="opcional" />
              </Field>
              <Field label="Cintura (cm)">
                <input type="number" className="input" value={f.waist} onChange={(e) => up({ waist: e.target.value })} placeholder="opcional" />
              </Field>
              <Field label="Brazo (cm)">
                <input type="number" className="input" value={f.arm} onChange={(e) => up({ arm: e.target.value })} placeholder="opcional" />
              </Field>
              <Field label="Muslo (cm)">
                <input type="number" className="input" value={f.thigh} onChange={(e) => up({ thigh: e.target.value })} placeholder="opcional" />
              </Field>
            </div>
            <div className="card p-3 mt-4 flex items-center justify-between">
              <span className="text-sm text-muted">IMC estimado</span>
              <span className="font-display text-lg tabular" style={{ color: cat.color }}>
                {preview.bmi} · {cat.label}
              </span>
            </div>
          </Section>
        )}

        {step === 2 && (
          <Section title="Tu experiencia y acceso">
            <Field label="Nivel de experiencia">
              <div className="flex flex-col gap-2">
                {[
                  ['principiante', 'Principiante (0-6 meses)'],
                  ['intermedio', 'Intermedio (6-24 meses)'],
                  ['avanzado', 'Avanzado (+24 meses)'],
                ].map(([v, l]) => (
                  <Radio key={v} active={f.experience === v} onClick={() => up({ experience: v })}>
                    {l}
                  </Radio>
                ))}
              </div>
            </Field>
            <Field label="¿Tienes acceso a gimnasio?">
              <div className="grid grid-cols-2 gap-2">
                <Radio active={f.hasGym} onClick={() => up({ hasGym: true })}>Sí, gimnasio</Radio>
                <Radio active={!f.hasGym} onClick={() => up({ hasGym: false })}>Entreno en casa</Radio>
              </div>
            </Field>
          </Section>
        )}

        {step === 3 && (
          <Section title="Tu objetivo">
            <Field label="Objetivo principal">
              <div className="flex flex-col gap-2">
                {Object.entries(GOALS).map(([v, g]) => (
                  <Radio key={v} active={f.goal === v} onClick={() => up({ goal: v })}>
                    {g.label}
                  </Radio>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peso objetivo (kg)">
                <input type="number" className="input" value={f.targetWeight} onChange={(e) => up({ targetWeight: e.target.value })} placeholder="opcional" />
              </Field>
              <Field label="¿Días que puedes ir?">
                <select className="input" value={f.daysPerWeek} onChange={(e) => up({ daysPerWeek: e.target.value })}>
                  {[3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>{d} días/semana</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="¿Cuánto tiempo tienes por sesión?">
              <div className="grid grid-cols-4 gap-2">
                {[30, 45, 60, 90].map((m) => (
                  <Radio key={m} active={+f.sessionMin === m} onClick={() => up({ sessionMin: m })}>
                    {m}′
                  </Radio>
                ))}
              </div>
            </Field>
            <p className="text-xs text-muted -mt-1">
              Ajustaremos la cantidad de ejercicios para que cada sesión te quepa en ese tiempo.
            </p>
          </Section>
        )}

        {step === 4 && (
          <Section title="Salud y nutrición">
            <Field label="¿Lesiones o limitaciones?">
              <textarea className="input min-h-[80px]" value={f.injuries} onChange={(e) => up({ injuries: e.target.value })} placeholder="Ej: molestia en hombro derecho (opcional)" />
            </Field>
            <Field label="Preferencia dietética">
              <select className="input" value={f.diet} onChange={(e) => up({ diet: e.target.value })}>
                <option value="omnivoro">Omnívoro</option>
                <option value="vegetariano">Vegetariano</option>
                <option value="vegano">Vegano</option>
                <option value="keto">Keto</option>
                <option value="singluten">Sin gluten</option>
              </select>
            </Field>
            <Field label="Alergias alimentarias">
              <input className="input" value={f.allergies} onChange={(e) => up({ allergies: e.target.value })} placeholder="opcional" />
            </Field>
          </Section>
        )}

        {step === 5 && (
          <Section title="¡Todo listo!" hint="Esto calculamos con tus datos:">
            <div className="grid grid-cols-2 gap-3">
              <Result label="Calorías objetivo" value={preview.calories} unit="kcal" color="#F97316" />
              <Result label="TDEE" value={preview.tdee} unit="kcal" color="#FB923C" />
              <Result label="Proteína" value={preview.macros.protein} unit="g" color="#22C55E" />
              <Result label="Carbohidratos" value={preview.macros.carbs} unit="g" color="#3B82F6" />
              <Result label="Grasas" value={preview.macros.fat} unit="g" color="#EAB308" />
              <Result label="IMC" value={preview.bmi} unit={cat.label} color={cat.color} />
            </div>
            <p className="text-sm text-muted mt-4">
              Generaremos tu rutina de <b className="text-slate-200">{f.daysPerWeek} días</b> y tu plan de
              nutrición automáticamente. Podrás ajustarlo cuando quieras.
            </p>
          </Section>
        )}
      </div>

      {/* Navegación */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button className="btn-ghost flex-1" onClick={back}>
            <ChevronLeft className="w-5 h-5" /> Atrás
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="btn-primary flex-1" onClick={next}>
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button className="btn-accent flex-1" onClick={finish}>
            <Check className="w-5 h-5" /> Empezar
          </button>
        )}
      </div>
    </div>
  )
}

function Section({ title, hint, children }) {
  return (
    <div>
      <h2 className="text-2xl uppercase mb-1">{title}</h2>
      {hint && <p className="text-sm text-muted mb-4">{hint}</p>}
      <div className="flex flex-col gap-4 mt-2">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Radio({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-xl border transition-colors ${
        active ? 'border-primary bg-primary/10 text-slate-100' : 'border-line bg-bg-soft text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function Result({ label, value, unit, color }) {
  return (
    <div className="card p-3">
      <div className="text-xs uppercase text-muted">{label}</div>
      <div className="font-display text-xl tabular" style={{ color }}>
        {value} <span className="text-xs text-muted font-sans">{unit}</span>
      </div>
    </div>
  )
}
