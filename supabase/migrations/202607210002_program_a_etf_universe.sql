-- Program A: canonical ETF Universe foundation
create table if not exists public.etf_master (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  name text not null,
  issuer text not null,
  exchange text not null,
  listing_status text not null default 'active',
  asset_class text not null,
  category text not null,
  strategy text not null,
  benchmark text,
  inception_date date,
  expense_ratio_pct numeric,
  aum_usd numeric,
  average_daily_volume numeric,
  distribution_frequency text not null default 'Unknown',
  options_strategy text,
  tags text[] not null default '{}',
  evidence_status text not null default 'missing',
  source_id text,
  source_as_of date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ticker, exchange)
);

create table if not exists public.etf_distributions (
  id uuid primary key default gen_random_uuid(),
  etf_id uuid not null references public.etf_master(id) on delete cascade,
  ex_date date not null,
  record_date date,
  pay_date date,
  amount numeric not null check (amount >= 0),
  currency text not null default 'USD',
  distribution_type text not null default 'unknown',
  evidence_status text not null default 'missing',
  source_id text,
  created_at timestamptz not null default now(),
  unique (etf_id, ex_date, amount, distribution_type)
);

create table if not exists public.etf_holdings (
  id uuid primary key default gen_random_uuid(),
  etf_id uuid not null references public.etf_master(id) on delete cascade,
  as_of_date date not null,
  symbol text,
  holding_name text not null,
  weight_pct numeric not null check (weight_pct >= 0 and weight_pct <= 100),
  sector text,
  industry text,
  country text,
  asset_type text,
  evidence_status text not null default 'missing',
  source_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.etf_relationships (
  id uuid primary key default gen_random_uuid(),
  from_etf_id uuid not null references public.etf_master(id) on delete cascade,
  to_etf_id uuid not null references public.etf_master(id) on delete cascade,
  relationship_type text not null,
  strength numeric not null check (strength >= 0 and strength <= 1),
  explanation text not null,
  evidence_status text not null default 'missing',
  as_of_date date,
  created_at timestamptz not null default now(),
  check (from_etf_id <> to_etf_id)
);

create index if not exists etf_master_ticker_idx on public.etf_master (ticker);
create index if not exists etf_master_issuer_idx on public.etf_master (issuer);
create index if not exists etf_master_strategy_idx on public.etf_master (strategy);
create index if not exists etf_distributions_etf_date_idx on public.etf_distributions (etf_id, ex_date desc);
create index if not exists etf_holdings_etf_date_idx on public.etf_holdings (etf_id, as_of_date desc);
create index if not exists etf_relationships_from_idx on public.etf_relationships (from_etf_id, relationship_type);
