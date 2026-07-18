-- ============================================================
-- Gym Companion — Migración: tabla public.profiles
-- Pega y ejecuta este archivo en: Supabase Dashboard > SQL Editor > New query
-- (Es idempotente: se puede ejecutar varias veces sin romper nada.)
-- ============================================================

-- Perfil legible por usuario (campos consultables, no solo el blob JSON de user_state).
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  name          text,
  age           integer,
  sex           text,
  weight        numeric,
  height        numeric,
  goal          text,
  experience    text,
  days_per_week integer,
  injuries      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row Level Security: cada usuario solo ve/edita su propia fila.
alter table public.profiles enable row level security;

drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile upsert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile upsert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Mantener updated_at al día (reutiliza touch_updated_at de schema.sql;
-- se define aquí también por si se ejecuta esta migración de forma aislada).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Alta automática: al registrarse un usuario se crea su fila en profiles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: crea filas de profiles para usuarios que ya existían antes de la migración.
insert into public.profiles (id, email)
select u.id, u.email from auth.users u
on conflict (id) do nothing;
