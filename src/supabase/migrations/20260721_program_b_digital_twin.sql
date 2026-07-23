create table if not exists digital_twin_scenarios (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
 name text not null, kind text not null, assumptions jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists digital_twin_holdings (
 id uuid primary key default gen_random_uuid(), scenario_id uuid references digital_twin_scenarios(id) on delete cascade,
 ticker text not null, market_value numeric not null, annual_yield numeric, annual_growth numeric, volatility numeric, expense_ratio numeric);
create table if not exists digital_twin_events (
 id uuid primary key default gen_random_uuid(), scenario_id uuid references digital_twin_scenarios(id) on delete cascade,
 event_year integer not null, amount numeric not null, event_type text not null, label text not null, recurring boolean not null default false);
create table if not exists digital_twin_runs (
 id uuid primary key default gen_random_uuid(), scenario_id uuid references digital_twin_scenarios(id) on delete cascade,
 engine_version text not null, inputs_hash text not null, results jsonb not null, created_at timestamptz not null default now());
alter table digital_twin_scenarios enable row level security;
create policy "users own twin scenarios" on digital_twin_scenarios using (auth.uid() = user_id) with check (auth.uid() = user_id);
