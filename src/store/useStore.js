import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildMetabolicProfile } from '../utils/calculations'
import { generateRoutine } from '../utils/routineGenerator'

export const todayStr = (d = new Date()) => d.toISOString().slice(0, 10)

const initial = {
  session: null, // { email }
  profile: null, // datos del formulario
  metabolic: null, // { bmr, tdee, calories, macros, bmi }
  routine: null,
  substitutions: {}, // { originalExerciseId: newExerciseId }
  workoutLog: [], // sesiones completadas
  dayNotes: {}, // { 'YYYY-MM-DD': {...} }
  foodLog: {}, // { 'YYYY-MM-DD': [ {..} ] }
  measurements: [], // [{ date, weight, chest, ... }]
  photos: [], // [{ date, dataUrl }]
  activeSupplements: [], // [{ id, doses, reminder }]
  chat: [], // [{ from:'user'|'coach', text, ts }]
  settings: { notifications: true },
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...initial,

      // ---- Auth ----
      // user: { id, email }
      login: (user) => set({ session: typeof user === 'string' ? { id: 'local', email: user } : user }),
      logout: () => set({ session: null }),

      // ---- Onboarding ----
      completeOnboarding: (profile) => {
        const metabolic = buildMetabolicProfile(profile)
        const routine = generateRoutine(profile, 0)
        set({
          profile,
          metabolic,
          routine,
          measurements: [
            {
              date: todayStr(),
              weight: profile.weight,
              chest: profile.chest || null,
              waist: profile.waist || null,
              hip: profile.hip || null,
              arm: profile.arm || null,
              thigh: profile.thigh || null,
              bodyFat: profile.bodyFat || null,
            },
          ],
        })
      },

      updateProfile: (patch) => {
        const profile = { ...get().profile, ...patch }
        set({ profile, metabolic: buildMetabolicProfile(profile) })
      },

      // ---- Rutina ----
      regenerateRoutine: () => {
        const { profile, routine } = get()
        if (!profile) return
        const nextCycle = ((routine?.cycle ?? 0) + 1) % 3
        set({ routine: generateRoutine(profile, nextCycle) })
      },
      substituteExercise: (originalId, newId) =>
        set({ substitutions: { ...get().substitutions, [originalId]: newId } }),

      // ---- Entrenamiento ----
      logWorkout: (session) =>
        set({ workoutLog: [{ id: crypto.randomUUID(), ...session }, ...get().workoutLog] }),

      // ---- Notas del día ----
      setDayNote: (date, patch) =>
        set({ dayNotes: { ...get().dayNotes, [date]: { ...get().dayNotes[date], ...patch } } }),

      // ---- Nutrición ----
      addFood: (date, entry) => {
        const log = get().foodLog
        const day = log[date] ? [...log[date]] : []
        day.push({ id: crypto.randomUUID(), ...entry })
        set({ foodLog: { ...log, [date]: day } })
      },
      removeFood: (date, id) => {
        const log = get().foodLog
        set({ foodLog: { ...log, [date]: (log[date] || []).filter((f) => f.id !== id) } })
      },

      // ---- Medidas y fotos ----
      addMeasurement: (m) => set({ measurements: [...get().measurements, { date: todayStr(), ...m }] }),
      addPhoto: (dataUrl) => set({ photos: [...get().photos, { date: todayStr(), dataUrl }] }),
      removePhoto: (idx) => set({ photos: get().photos.filter((_, i) => i !== idx) }),

      // ---- Suplementos ----
      toggleSupplement: (id, doses = 1) => {
        const list = get().activeSupplements
        const exists = list.find((s) => s.id === id)
        set({
          activeSupplements: exists
            ? list.filter((s) => s.id !== id)
            : [...list, { id, doses, reminder: false }],
        })
      },
      updateSupplement: (id, patch) =>
        set({
          activeSupplements: get().activeSupplements.map((s) =>
            s.id === id ? { ...s, ...patch } : s
          ),
        }),

      // ---- Chat ----
      pushChat: (msg) => set({ chat: [...get().chat, { ts: Date.now(), ...msg }] }),
      clearChat: () => set({ chat: [] }),

      // ---- Settings / reset ----
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'gym-companion-v1',
      version: 2,
      // Regenera rutinas creadas antes del rediseño para que tengan los campos nuevos
      // (duración estimada, volumen semanal, distribución de días, etc.)
      migrate: (persisted) => {
        try {
          if (persisted?.profile && persisted?.routine && !persisted.routine.weeklyVolume) {
            persisted.routine = generateRoutine(persisted.profile, persisted.routine.cycle || 0)
          }
        } catch {}
        return persisted
      },
    }
  )
)
