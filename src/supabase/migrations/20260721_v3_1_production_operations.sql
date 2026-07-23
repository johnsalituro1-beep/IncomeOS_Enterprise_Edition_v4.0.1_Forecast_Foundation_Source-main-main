-- IncomeOS v3.1 production operations, incident response, backup verification, and health history
create table if not exists public.system_health_checks (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  status text not null check (status in ('operational','degraded','outage','maintenance','unknown')),
  latency_ms integer,
  detail text not null default '',
  checked_at timestamptz not null default now()
);
create table if not exists public.production_incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity text not null check (severity in ('info','warning','critical')),
  status text not null check (status in ('open','monitoring','resolved')),
  message text not null default '',
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by uuid references auth.users(id)
);
create table if not exists public.backup_verifications (
  id uuid primary key default gen_random_uuid(),
  backup_at timestamptz not null,
  verified_at timestamptz,
  restore_tested_at timestamptz,
  status text not null check (status in ('pending','verified','failed')),
  notes text not null default '',
  verified_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.deployment_events (
  id uuid primary key default gen_random_uuid(),
  environment text not null,
  version text not null,
  commit_sha text,
  status text not null check (status in ('started','succeeded','failed','rolled_back')),
  smoke_test_status text not null default 'pending' check (smoke_test_status in ('pending','passed','failed')),
  deployed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists system_health_checks_service_checked_idx on public.system_health_checks(service_name, checked_at desc);
create index if not exists production_incidents_status_started_idx on public.production_incidents(status, started_at desc);
create index if not exists deployment_events_environment_deployed_idx on public.deployment_events(environment, deployed_at desc);
alter table public.system_health_checks enable row level security;
alter table public.production_incidents enable row level security;
alter table public.backup_verifications enable row level security;
alter table public.deployment_events enable row level security;
-- Operational tables are intentionally denied to ordinary authenticated users.
-- Server workers use the service role; admin read policies should be attached to a verified custom claim during deployment.
