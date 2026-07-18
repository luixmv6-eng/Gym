import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  CalendarDays,
  UtensilsCrossed,
  MessageSquare,
  Pill,
  TrendingUp,
  User,
  Lightbulb,
} from 'lucide-react'

const NAV = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/routines', label: 'Rutina', icon: Dumbbell },
  { to: '/calendar', label: 'Agenda', icon: CalendarDays },
  { to: '/nutrition', label: 'Nutrición', icon: UtensilsCrossed },
  { to: '/coach', label: 'Coach', icon: MessageSquare },
]

export const MORE = [
  { to: '/supplements', label: 'Suplementos', icon: Pill },
  { to: '/progress', label: 'Progreso', icon: TrendingUp },
  { to: '/tips', label: 'Tips', icon: Lightbulb },
  { to: '/profile', label: 'Perfil', icon: User },
]

export default function Layout({ children }) {
  const loc = useLocation()
  const title =
    [...NAV, ...MORE].find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to) && n.to !== '/'))
      ?.label || 'Gym Companion'

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header glass */}
      <header className="sticky top-0 z-30 glass border-b border-line/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ember flex items-center justify-center shadow-glow">
              <Dumbbell className="w-5 h-5 text-slate-950" strokeWidth={2.6} />
            </div>
            <span className="font-display text-lg uppercase tracking-wide">{title}</span>
          </div>
          <nav className="flex items-center gap-0.5">
            {MORE.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                title={label}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-100 hover:bg-bg-soft/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-5 pb-28">{children}</main>

      {/* Bottom nav glass con indicador activo */}
      <nav className="fixed bottom-0 inset-x-0 z-30 glass border-t border-line/40 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto grid grid-cols-5 px-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ember" />
                  )}
                  <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
