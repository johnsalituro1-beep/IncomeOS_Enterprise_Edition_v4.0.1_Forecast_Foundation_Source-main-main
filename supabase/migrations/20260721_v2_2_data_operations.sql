-- IncomeOS v2.2: scheduled data operations, retries, provider health and audit history
create table if not exists public.data_operation_runs (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_kind text not null check (operation_kind in ('market-data','distributions')),
  status text not null check (status in ('queued','running','succeeded','failed','degraded')),
  provider_id text not null,
  attempt integer not null default 1 check (attempt > 0),
  requested_count integer not null default 0,
  accepted_count integer not null default 0,
  rejected_count integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  next_retry_at timestamptz,
  message text not null default '',
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists data_operation_runs_user_started_idx on public.data_operation_runs(user_id, started_at desc);
create index if not exists data_operation_runs_retry_idx on public.data_operation_runs(next_retry_at) where next_retry_at is not null;
alter table public.data_operation_runs enable row level security;
drop policy if exists "Users manage own operation runs" on public.data_operation_runs;
create policy "Users manage own operation runs" on public.data_operation_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.data_refresh_schedules (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_kind text not null check (operation_kind in ('market-data','distributions')),
  enabled boolean not null default true,
  interval_minutes integer not null check (interval_minutes >= 15),
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(portfolio_id, operation_kind)
);
alter table public.data_refresh_schedules enable row level security;
drop policy if exists "Users manage own refresh schedules" on public.data_refresh_schedules;
create policy "Users manage own refresh schedules" on public.data_refresh_schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
