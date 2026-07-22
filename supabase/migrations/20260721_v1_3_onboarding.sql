-- IncomeOS Enterprise Edition v1.3 — Portfolio Onboarding & Investor Experience
create table if not exists public.investor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  retirement_age integer check (retirement_age between 18 and 100),
  weekly_income_target numeric(14,2) check (weekly_income_target >= 0),
  annual_contribution numeric(14,2) not null default 0,
  reinvestment_pct numeric(5,2) not null default 0 check (reinvestment_pct between 0 and 100),
  cash_reserve_months integer not null default 0 check (cash_reserve_months between 0 and 120),
  risk_tolerance text not null default 'Moderate' check (risk_tolerance in ('Conservative','Moderate','Growth','Aggressive')),
  estimated_tax_rate_pct numeric(5,2) not null default 0 check (estimated_tax_rate_pct between 0 and 60),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('manual','csv','broker_export','demo')),
  original_filename text,
  imported_rows integer not null default 0,
  rejected_rows integer not null default 0,
  warning_count integer not null default 0,
  status text not null default 'completed' check (status in ('pending','completed','partial','failed')),
  mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.investor_profiles enable row level security;
alter table public.portfolio_imports enable row level security;

drop policy if exists "investor_profiles_owner" on public.investor_profiles;
create policy "investor_profiles_owner" on public.investor_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "portfolio_imports_owner" on public.portfolio_imports;
create policy "portfolio_imports_owner" on public.portfolio_imports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
