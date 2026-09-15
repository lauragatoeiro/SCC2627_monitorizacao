-- ============================================================
-- SWIM MONITOR - BASE DE DADOS SUPABASE
-- Executar este ficheiro inteiro no SQL Editor do Supabase.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sex smallint not null check (sex in (0,1)),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  record_date date not null,
  pse_am numeric(4,1),
  pse_pm numeric(4,1),
  waking_hr integer,
  sleep_quality numeric(4,1),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.body_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  record_date date not null,
  body_mass numeric(6,2),
  height_cm numeric(6,1),
  skinfold_1 numeric(6,1) not null,
  skinfold_2 numeric(6,1) not null,
  skinfold_3 numeric(6,1) not null,
  skinfold_4 numeric(6,1) not null,
  skinfold_5 numeric(6,1) not null,
  skinfold_6 numeric(6,1) not null,
  skinfold_7 numeric(6,1) not null,
  sum7 numeric(7,1) not null,
  body_fat numeric(6,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.physical_tests (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  record_date date not null,
  cmj_1 numeric(6,1),
  cmj_2 numeric(6,1),
  horizontal_jump_1 numeric(6,1),
  horizontal_jump_2 numeric(6,1),
  created_at timestamptz not null default now()
);

create index if not exists daily_records_athlete_date_idx on public.daily_records(athlete_id, record_date);
create index if not exists body_records_athlete_date_idx on public.body_records(athlete_id, record_date);
create index if not exists physical_tests_athlete_date_idx on public.physical_tests(athlete_id, record_date);

-- RLS: apenas utilizadores autenticados podem consultar/alterar os dados.
alter table public.athletes enable row level security;
alter table public.daily_records enable row level security;
alter table public.body_records enable row level security;
alter table public.physical_tests enable row level security;

drop policy if exists "authenticated full access athletes" on public.athletes;
drop policy if exists "authenticated full access daily" on public.daily_records;
drop policy if exists "authenticated full access body" on public.body_records;
drop policy if exists "authenticated full access tests" on public.physical_tests;

create policy "authenticated full access athletes"
on public.athletes for all to authenticated using (true) with check (true);

create policy "authenticated full access daily"
on public.daily_records for all to authenticated using (true) with check (true);

create policy "authenticated full access body"
on public.body_records for all to authenticated using (true) with check (true);

create policy "authenticated full access tests"
on public.physical_tests for all to authenticated using (true) with check (true);

-- Permissões necessárias para o Data API.
grant select, insert, update, delete on public.athletes to authenticated;
grant select, insert, update, delete on public.daily_records to authenticated;
grant select, insert, update, delete on public.body_records to authenticated;
grant select, insert, update, delete on public.physical_tests to authenticated;
