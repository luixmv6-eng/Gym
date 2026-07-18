import { useState } from 'react'
import { FAQ, TIPS } from '../data/content'
import { Card } from '../components/ui'
import { ChevronDown, Lightbulb, HelpCircle } from 'lucide-react'

export default function Tips() {
  const [open, setOpen] = useState(null)
  return (
    <div className="flex flex-col gap-5 stagger">
      <h1 className="text-2xl uppercase">Tips & Educación</h1>

      <div>
        <h2 className="text-lg uppercase mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" /> Consejos rápidos
        </h2>
        <div className="grid gap-2">
          {TIPS.map((t, i) => (
            <Card key={i} className="py-3 flex items-start gap-3 bg-bg-soft">
              <span className="font-display text-primary text-lg tabular w-6 shrink-0">{i + 1}</span>
              <p className="text-sm text-slate-200">{t}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg uppercase mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" /> Preguntas frecuentes
        </h2>
        <div className="grid gap-2">
          {FAQ.map((f, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-sm pr-3">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <p className="px-4 pb-4 text-sm text-slate-300 animate-fade-up border-t border-line pt-3">
                  {f.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
