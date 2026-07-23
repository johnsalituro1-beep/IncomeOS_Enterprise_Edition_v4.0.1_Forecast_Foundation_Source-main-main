-- ETF Dividend Calendar Pro v4.0 Milestone 1
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  weekly_income_goal numeric(14,2) not null default 2000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, description text, base_currency text not null default 'USD', is_default boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(), portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null, fund_name text, shares numeric(20,6) not null check (shares >= 0), average_cost numeric(20,6) not null default 0,
  current_price numeric(20,6) not null default 0, annual_distribution_per_share numeric(20,6) not null default 0,
  payment_frequency text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(portfolio_id,ticker)
);
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(), portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  holding_id uuid references public.holdings(id) on delete set null, transaction_type text not null check(transaction_type in ('buy','sell','dividend','fee','deposit','withdrawal')),
  ticker text, trade_date date not null default current_date, shares numeric(20,6) not null default 0, price numeric(20,6) not null default 0,
  fees numeric(20,6) not null default 0, notes text, created_at timestamptz not null default now()
);
create table if not exists public.income_goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Primary Income Goal', weekly_target numeric(14,2), monthly_target numeric(14,2), annual_target numeric(14,2), target_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, created_at timestamptz not null default now()
);
create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(), watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  ticker text not null, created_at timestamptz not null default now(), unique(watchlist_id,ticker)
);

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.income_goals enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;

create policy "profiles_self" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "portfolios_owner" on public.portfolios for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "holdings_owner" on public.holdings for all using (exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid())) with check (exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid()));
create policy "transactions_owner" on public.transactions for all using (exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid())) with check (exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid()));
create policy "income_goals_owner" on public.income_goals for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "watchlists_owner" on public.watchlists for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "watchlist_items_owner" on public.watchlist_items for all using (exists(select 1 from public.watchlists w where w.id=watchlist_id and w.user_id=auth.uid())) with check (exists(select 1 from public.watchlists w where w.id=watchlist_id and w.user_id=auth.uid()));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))) on conflict do nothing;
 insert into public.portfolios(user_id,name,is_default) values(new.id,'My Income Portfolio',true);
 insert into public.income_goals(user_id,name,weekly_target,annual_target) values(new.id,'$2,000 Weekly Income Goal',2000,104000);
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
