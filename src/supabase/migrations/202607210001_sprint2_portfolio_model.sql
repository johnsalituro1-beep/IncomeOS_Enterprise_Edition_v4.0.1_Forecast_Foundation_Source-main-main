-- Sprint 2 draft: cloud portfolio model. Do not apply as part of Sprint 1.
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Income Portfolio',
  weekly_income_goal numeric(14,2) not null default 2000 check (weekly_income_goal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null check (char_length(ticker) between 1 and 12),
  fund_name text not null,
  shares numeric(20,6) not null check (shares > 0),
  average_cost numeric(20,6) not null check (average_cost >= 0),
  current_price numeric(20,6) not null check (current_price >= 0),
  annual_distribution_per_share numeric(20,6) not null default 0 check (annual_distribution_per_share >= 0),
  payment_frequency text not null check (payment_frequency in ('Weekly','Monthly','Quarterly')),
  category text not null default 'Other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;

create policy "Users manage their portfolios" on public.portfolios
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage holdings in their portfolios" on public.holdings
for all using (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid()));

create index if not exists portfolios_user_id_idx on public.portfolios(user_id);
create index if not exists holdings_portfolio_id_idx on public.holdings(portfolio_id);
