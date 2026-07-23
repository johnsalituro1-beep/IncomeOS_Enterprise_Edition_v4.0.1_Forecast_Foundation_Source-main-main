-- IncomeOS Enterprise Edition v1.2 — Live ETF Data Platform
create table if not exists data_providers (
  id text primary key,
  name text not null,
  environment text not null check (environment in ('sandbox','production')),
  enabled boolean not null default false,
  capabilities jsonb not null default '[]'::jsonb,
  rate_limit_per_minute integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider_id text references data_providers(id),
  job_type text not null,
  status text not null check (status in ('queued','running','succeeded','partial','failed')),
  requested_symbols integer not null default 0,
  accepted_records integer not null default 0,
  rejected_records integer not null default 0,
  warning_count integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists provider_records (
  id uuid primary key default gen_random_uuid(),
  provider_id text references data_providers(id),
  kind text not null,
  symbol text not null,
  effective_at timestamptz not null,
  retrieved_at timestamptz not null default now(),
  classification text not null,
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  source_record_id text,
  payload jsonb not null,
  content_hash text not null,
  ingestion_run_id uuid references ingestion_runs(id),
  unique(provider_id, kind, symbol, effective_at, content_hash)
);

create table if not exists data_validation_issues (
  id uuid primary key default gen_random_uuid(),
  ingestion_run_id uuid references ingestion_runs(id) on delete cascade,
  code text not null,
  severity text not null check (severity in ('info','warning','critical')),
  symbol text,
  kind text,
  message text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists provider_records_symbol_kind_idx on provider_records(symbol, kind, effective_at desc);
create index if not exists validation_issues_open_idx on data_validation_issues(severity, created_at desc) where resolved_at is null;

alter table data_providers enable row level security;
alter table ingestion_runs enable row level security;
alter table provider_records enable row level security;
alter table data_validation_issues enable row level security;
