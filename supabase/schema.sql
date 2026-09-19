-- CONTROL PERSONAL - esquema inicial seguro por usuario
create extension if not exists pgcrypto;

create table if not exists weight_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), measured_at timestamptz not null default now(), weight_kg numeric not null, body_fat_pct numeric, waist_cm numeric);
create table if not exists food_catalog (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), name text not null, kcal_per_100g numeric not null, protein_g numeric default 0, carbs_g numeric default 0, fat_g numeric default 0);
create table if not exists meals (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), eaten_at timestamptz not null default now(), food_id uuid references food_catalog(id) on delete set null, grams numeric not null, calories numeric not null);
create table if not exists running_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), run_at timestamptz not null default now(), distance_km numeric not null, duration_min numeric not null, elevation_m numeric, calories numeric, notes text);
create table if not exists gym_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), trained_at timestamptz not null default now(), workout_type text not null, exercise text not null, sets int not null, reps int not null, weight_kg numeric, notes text);
create table if not exists accounts (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), name text not null, balance numeric not null default 0, created_at timestamptz not null default now());
create table if not exists transactions (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), account_id uuid references accounts(id) on delete set null, occurred_at timestamptz not null default now(), type text not null check(type in ('ingreso','gasto')), amount numeric not null check(amount>=0), description text);
create table if not exists credit_cards (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), name text not null, credit_limit numeric not null default 0, statement_day int, payment_day int);
create table if not exists installments (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), card_id uuid references credit_cards(id) on delete cascade, description text not null, total_amount numeric not null, months int not null, paid_months int not null default 0, start_date date not null default current_date);

alter table weight_logs enable row level security; alter table food_catalog enable row level security; alter table meals enable row level security; alter table running_logs enable row level security; alter table gym_logs enable row level security; alter table accounts enable row level security; alter table transactions enable row level security; alter table credit_cards enable row level security; alter table installments enable row level security;

do $$ declare t text; begin foreach t in array array['weight_logs','food_catalog','meals','running_logs','gym_logs','accounts','transactions','credit_cards','installments'] loop execute format('drop policy if exists "own rows" on %I',t); execute format('create policy "own rows" on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',t); end loop; end $$;

-- Alimentos iniciales: agrégalos desde la app después de iniciar sesión para que queden ligados a tu usuario.
