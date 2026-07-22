-- IncomeOS Enterprise Edition v2.1 — Phase 2 Milestone 2
alter table public.distribution_events add column if not exists provider_id text;
alter table public.distribution_events add column if not exists provider_record_id text;
alter table public.distribution_events add column if not exists revision integer not null default 1 check (revision > 0);
alter table public.distribution_events add column if not exists classification text;
alter table public.distribution_events add column if not exists confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1));
alter table public.distribution_events add column if not exists retrieved_at timestamptz;
alter table public.distribution_events add column if not exists provider_updated_at timestamptz;
alter table public.distribution_events add column if not exists is_manual_override boolean not null default false;
create unique index if not exists distribution_events_provider_record_uidx on public.distribution_events(portfolio_id,provider_id,provider_record_id) where provider_record_id is not null;
create index if not exists distribution_events_provider_freshness_idx on public.distribution_events(portfolio_id,retrieved_at desc);

create table if not exists public.distribution_sync_runs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 portfolio_id uuid references public.portfolios(id) on delete cascade, provider_id text not null,
 status text not null check(status in ('succeeded','partial','failed')), requested_symbols integer not null default 0,
 received_records integer not null default 0, inserted_records integer not null default 0, updated_records integer not null default 0,
 skipped_records integer not null default 0, rejected_records integer not null default 0, fallback_used boolean not null default false,
 started_at timestamptz not null, completed_at timestamptz not null, error_message text
);
create index if not exists distribution_sync_runs_user_completed_idx on public.distribution_sync_runs(user_id,completed_at desc);
alter table public.distribution_sync_runs enable row level security;
drop policy if exists "Users manage own distribution sync runs" on public.distribution_sync_runs;
create policy "Users manage own distribution sync runs" on public.distribution_sync_runs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
