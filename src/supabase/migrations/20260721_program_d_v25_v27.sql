create table if not exists public.intelligence_analytics_runs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), portfolio_id uuid,
  regime text not null, trend text not null, benchmark_delta numeric, goal_completion_pct numeric,
  projected_weekly_income_12m numeric, adaptive_weights jsonb not null default '{}'::jsonb,
  alerts jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.portfolio_optimization_runs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), portfolio_id uuid,
  constraints jsonb not null, objectives jsonb not null, result jsonb not null,
  feasible boolean not null default false, approved_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.executive_briefs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), portfolio_id uuid,
  headline text not null, brief jsonb not null, evidence_coverage numeric, created_at timestamptz not null default now()
);
alter table public.intelligence_analytics_runs enable row level security;
alter table public.portfolio_optimization_runs enable row level security;
alter table public.executive_briefs enable row level security;
create policy "owners manage analytics" on public.intelligence_analytics_runs using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "owners manage optimizations" on public.portfolio_optimization_runs using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "owners manage briefs" on public.executive_briefs using (auth.uid()=user_id) with check (auth.uid()=user_id);
