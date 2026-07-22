-- IncomeOS Enterprise Edition v1.5 — Phase 1 Milestone 2
alter table public.holdings add column if not exists category text not null default 'Other';
alter table public.holdings drop constraint if exists holdings_payment_frequency_check;
alter table public.holdings add constraint holdings_payment_frequency_check check (payment_frequency in ('Weekly','Monthly','Quarterly'));
create index if not exists holdings_portfolio_ticker_idx on public.holdings(portfolio_id,ticker);
create index if not exists transactions_portfolio_trade_date_idx on public.transactions(portfolio_id,trade_date desc,created_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists holdings_touch_updated_at on public.holdings;
create trigger holdings_touch_updated_at before update on public.holdings for each row execute function public.touch_updated_at();
drop trigger if exists portfolios_touch_updated_at on public.portfolios;
create trigger portfolios_touch_updated_at before update on public.portfolios for each row execute function public.touch_updated_at();
drop trigger if exists income_goals_touch_updated_at on public.income_goals;
create trigger income_goals_touch_updated_at before update on public.income_goals for each row execute function public.touch_updated_at();
