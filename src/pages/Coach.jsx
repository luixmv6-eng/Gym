import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore, todayStr } from '../store/useStore'
import { askCoach, aiEnabled } from '../services/coach'
import { getSupplement } from '../data/supplements'
import { Send, Trash2, Sparkles, Pill, UtensilsCrossed, Dumbbell } from 'lucide-react'

const SUGGESTIONS = [
  '¿Cómo mejoro mi técnica en sentadilla?',
  '¿Qué como después de entrenar?',
  '¿Cuándo debo cambiar de rutina?',
  '¿Cómo me recupero más rápido?',
]

// Detecta intención en la respuesta del coach para ofrecer un atajo contextual.
function actionFor(text) {
  const t = text.toLowerCase()
  if (/(creatina|proteína|proteina|suplement|cafeína|omega|magnesio|dosis)/.test(t))
    return { to: '/supplements', label: 'Calcular dosis de suplemento', icon: Pill }
  if (/(come|comida|caloría|caloria|macro|dieta|nutrici|proteína|carbo)/.test(t))
    return { to: '/nutrition', label: 'Ver mi plan de comidas', icon: UtensilsCrossed }
  if (/(rutina|ejercicio|técnica|tecnica|serie|repetici)/.test(t))
    return { to: '/routines', label: 'Ver mi rutina', icon: Dumbbell }
  return null
}

export default function Coach() {
  const store = useStore()
  const { chat, pushChat, clearChat, profile, metabolic } = store
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat, typing])

  const buildContext = () => {
    const s = useStore.getState()
    const today = todayStr()
    const dow = (new Date().getDay() + 6) % 7
    const plan = s.routine?.week?.[dow]
    const eaten = (s.foodLog[today] || []).reduce(
      (a, f) => ({ p: a.p + f.p, c: a.c + f.c, f: a.f + f.f, kcal: a.kcal + f.kcal }),
      { p: 0, c: 0, f: 0, kcal: 0 }
    )
    const recent = s.workoutLog[0]?.exercises?.map((e) => e.name).slice(0, 4).join(', ')
    return {
      todayPlan: plan?.rest ? 'Descanso' : plan?.title,
      totalWorkouts: s.workoutLog.length,
      recentExercises: recent,
      eatenToday: { kcal: Math.round(eaten.kcal), p: Math.round(eaten.p), c: Math.round(eaten.c), f: Math.round(eaten.f) },
      activeSupplements: s.activeSupplements.map((a) => getSupplement(a.id)?.name).join(', ') || 'ninguno',
    }
  }

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || typing) return
    setInput('')
    pushChat({ from: 'user', text: msg })
    setTyping(true)
    const history = [...chat, { from: 'user', text: msg }]
    const reply = await askCoach(history, profile, metabolic, buildContext())
    setTyping(false)
    pushChat({ from: 'coach', text: reply })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-9rem)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg uppercase leading-none">Coach AI</h1>
            <span className="text-xs text-muted flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${aiEnabled ? 'bg-accent' : 'bg-slate-500'}`} />
              {aiEnabled ? 'En línea' : 'Modo offline'}
            </span>
          </div>
        </div>
        {chat.length > 0 && (
          <button onClick={clearChat} className="p-2 text-slate-400 hover:text-red-400" aria-label="Limpiar chat">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {chat.length === 0 && (
          <div className="card p-4 bg-bg-soft">
            <p className="text-sm text-slate-200">
              ¡Hola {profile?.name?.split(' ')[0] || ''}! Soy tu Coach AI. Conozco tu perfil, tu rutina y
              lo que llevas comido hoy. Pregúntame sobre técnica, nutrición, suplementos o recuperación. 💪
            </p>
          </div>
        )}
        {chat.map((m, i) => (
          <Bubble key={i} from={m.from} text={m.text} />
        ))}
        {typing && (
          <div className="self-start card px-4 py-3 bg-bg-soft">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {chat.length === 0 && (
        <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="chip border-line text-slate-300 whitespace-nowrap shrink-0 hover:border-primary">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <textarea
          rows={1}
          className="input resize-none py-3"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button className="btn-primary px-4 shrink-0" onClick={() => send()} disabled={!input.trim() || typing} aria-label="Enviar">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function Bubble({ from, text }) {
  const isUser = from === 'user'
  const action = isUser ? null : actionFor(text)
  return (
    <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
      <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap animate-fade-up ${
        isUser
          ? 'bg-primary text-slate-900 rounded-br-sm'
          : 'bg-bg-card border border-line text-slate-100 rounded-bl-sm'
      }`}>
        {text}
      </div>
      {action && (
        <Link to={action.to} className="chip border-primary/40 text-primary bg-primary/10 text-xs">
          <action.icon className="w-3.5 h-3.5" /> {action.label}
        </Link>
      )}
    </div>
  )
}
