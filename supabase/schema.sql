-- ============================================================
-- Gym Companion — Esquema de Supabase
-- Ejecuta este archivo en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Estado de la app por usuario (snapshot JSON offline-first).
-- Cada fila pertenece a un usuario autenticado y solo él puede leerla/escribirla.
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Tabla opcional para consultas relacionales de medidas (histórico).
create table if not exists public.measurements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  taken_on   date not null default current_date,
  weight     numeric,
  chest      numeric,
  waist      numeric,
  hip        numeric,
  arm        numeric,
  thigh      numeric,
  body_fat   numeric,
  created_at timestamptz not null default now()
);

-- Tabla opcional para consultas relacionales de entrenamientos.
create table if not exists public.workouts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  done_on     date not null default current_date,
  day_title   text,
  duration_min integer,
  exercises   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security: cada usuario solo ve/edita SUS filas.
-- ============================================================
alter table public.user_state   enable row level security;
alter table public.measurements enable row level security;
alter table public.workouts     enable row level security;

-- user_state
drop policy if exists "own state select" on public.user_state;
drop policy if exists "own state upsert" on public.user_state;
drop policy if exists "own state update" on public.user_state;
create policy "own state select" on public.user_state
  for select using (auth.uid() = user_id);
create policy "own state upsert" on public.user_state
  for insert with check (auth.uid() = user_id);
create policy "own state update" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- measurements
drop policy if exists "own measurements" on public.measurements;
create policy "own measurements" on public.measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- workouts
drop policy if exists "own workouts" on public.workouts;
create policy "own workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Trigger para mantener updated_at al día en user_state
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch
  before update on public.user_state
  for each row execute function public.touch_updated_at();

-- ============================================================
-- LISTO. Notas de configuración adicional:
--   • Auth > Providers: activa "Email" y (opcional) "Google" con tu OAuth Client.
--   • Auth > URL Configuration: añade tu dominio (y http://localhost:5173) a
--     "Site URL" y "Redirect URLs" para el OAuth de Google.
--   • Copia Project URL y anon key a tu archivo .env (VITE_SUPABASE_*).
-- ============================================================
