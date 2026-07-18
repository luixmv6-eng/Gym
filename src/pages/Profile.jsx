import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { GOALS } from '../data/content'
import { Card, Stat, SectionTitle } from '../components/ui'
import { bmiCategory } from '../utils/calculations'
import { signOut } from '../services/auth'
import { stopSync } from '../services/sync'
import { isSupabaseEnabled } from '../services/supabaseClient'
import { LogOut, Download, Trash2, User, Bell, Cloud, CloudOff } from 'lucide-react'

export default function Profile() {
  const { profile, metabolic, updateProfile, logout, resetAll, settings, updateSettings, workoutLog, session } = useStore()
  const nav = useNavigate()
  const cat = bmiCategory(metabolic?.bmi)

  const exportData = () => {
    const data = useStore.getState()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-companion-${profile?.name || 'datos'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doLogout = async () => {
    stopSync()
    await signOut()
    logout()
    nav('/login')
  }

  const wipe = async () => {
    if (confirm('¿Borrar TODOS tus datos? Esta acción no se puede deshacer.')) {
      resetAll()
      stopSync()
      await signOut()
      logout()
      nav('/login')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera perfil */}
      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl uppercase leading-tight">{profile?.name || 'Atleta'}</h1>
          <p className="text-sm text-muted">
            {profile?.age} años · {GOALS[profile?.goal]?.label}
          </p>
        </div>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Calorías objetivo" value={metabolic?.calories} unit="kcal" />
        <Stat label="TDEE" value={metabolic?.tdee} unit="kcal" color="#FB923C" />
        <Stat label="BMR" value={metabolic?.bmr} unit="kcal" color="#3B82F6" />
        <Stat label="IMC" value={metabolic?.bmi} unit={cat.label} color={cat.color} />
        <Stat label="Sesiones" value={workoutLog.length} unit="total" color="#22C55E" />
        <Stat label="Días/semana" value={profile?.daysPerWeek} unit="días" color="#A855F7" />
      </div>

      {/* Editar datos clave */}
      <Card>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <EditField label="Peso (kg)" value={profile?.weight} onSave={(v) => updateProfile({ weight: +v })} />
          <EditField label="Altura (cm)" value={profile?.height} onSave={(v) => updateProfile({ height: +v })} />
          <div className="col-span-2">
            <label className="label">Objetivo</label>
            <select
              className="input"
              value={profile?.goal}
              onChange={(e) => updateProfile({ goal: e.target.value })}
            >
              {Object.entries(GOALS).map(([v, g]) => (
                <option key={v} value={v}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Ajustes */}
      <Card>
        <SectionTitle>Preferencias</SectionTitle>
        <label className="flex items-center justify-between py-2">
          <span className="flex items-center gap-2 text-sm text-slate-200">
            <Bell className="w-4 h-4 text-muted" /> Notificaciones y recordatorios
          </span>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => updateSettings({ notifications: e.target.checked })}
            className="accent-primary w-5 h-5"
          />
        </label>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col gap-2">
        <button className="btn-ghost justify-start" onClick={exportData}>
          <Download className="w-5 h-5" /> Exportar mis datos (JSON)
        </button>
        <button className="btn-ghost justify-start" onClick={doLogout}>
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
        <button
          className="btn justify-start bg-red-500/10 border border-red-500/30 text-red-400 px-4"
          onClick={wipe}
        >
          <Trash2 className="w-5 h-5" /> Borrar cuenta y datos
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
        {isSupabaseEnabled ? (
          <>
            <Cloud className="w-3.5 h-3.5 text-accent" /> Sincronizado en la nube · {session?.email}
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5" /> Modo local (sin sincronización)
          </>
        )}
      </div>
      <p className="text-center text-xs text-slate-600 -mt-2">Gym Companion v1.0 · PWA offline-first</p>
    </div>
  )
}

function EditField({ label, value, onSave }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        className="input"
        defaultValue={value}
        onBlur={(e) => e.target.value && onSave(e.target.value)}
      />
    </div>
  )
}
