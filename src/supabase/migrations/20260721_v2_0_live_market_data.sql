create table if not exists public.market_quote_cache (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null, price numeric not null check (price > 0), previous_close numeric, currency text not null default 'USD',
  market_time timestamptz not null, retrieved_at timestamptz not null, provider_id text not null, classification text not null,
  updated_at timestamptz not null default now(), unique(user_id, symbol)
);
create index if not exists market_quote_cache_user_retrieved_idx on public.market_quote_cache(user_id, retrieved_at desc);
alter table public.market_quote_cache enable row level security;
drop policy if exists "Users manage own quote cache" on public.market_quote_cache;
create policy "Users manage own quote cache" on public.market_quote_cache for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.market_data_refresh_runs (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
 provider_id text not null, status text not null check(status in ('running','succeeded','partial','failed')),
 requested_symbols integer not null default 0, accepted_records integer not null default 0, fallback_used boolean not null default false,
 started_at timestamptz not null default now(), completed_at timestamptz, error_message text
);
alter table public.market_data_refresh_runs enable row level security;
create policy "Users read own refresh runs" on public.market_data_refresh_runs for select using (auth.uid() = user_id);
