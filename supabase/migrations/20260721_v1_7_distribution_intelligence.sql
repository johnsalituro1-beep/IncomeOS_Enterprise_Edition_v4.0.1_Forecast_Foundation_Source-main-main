-- IncomeOS Enterprise Edition v1.7 — Phase 1 Milestone 3B
create table if not exists public.distribution_events (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null,
  amount_per_share numeric(18,8) not null check (amount_per_share > 0),
  declaration_date date,
  ex_date date,
  record_date date,
  payment_date date not null,
  frequency text not null check (frequency in ('Weekly','Monthly','Quarterly','Irregular')),
  status text not null default 'declared' check (status in ('declared','paid','estimated')),
  source text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distribution_ex_before_payment check (ex_date is null or ex_date <= payment_date)
);
create index if not exists distribution_events_portfolio_payment_idx on public.distribution_events(portfolio_id,payment_date desc);
create index if not exists distribution_events_portfolio_ticker_idx on public.distribution_events(portfolio_id,ticker,payment_date desc);
alter table public.distribution_events enable row level security;
drop policy if exists "Users manage distributions for owned portfolios" on public.distribution_events;
create policy "Users manage distributions for owned portfolios" on public.distribution_events for all using (
  exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid())
) with check (
  exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid())
);
drop trigger if exists distribution_events_touch_updated_at on public.distribution_events;
create trigger distribution_events_touch_updated_at before update on public.distribution_events for each row execute function public.touch_updated_at();
