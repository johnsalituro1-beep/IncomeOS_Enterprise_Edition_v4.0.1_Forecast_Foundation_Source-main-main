-- Program A Phase 2: Historical ETF Data Warehouse
create table if not exists etf_source_lineage (
  source_id text primary key,
  provider text not null,
  dataset text not null,
  acquired_at timestamptz not null,
  license_class text not null check (license_class in ('authoritative','licensed','public','development')),
  checksum text not null,
  record_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists etf_price_history (
  fund_id uuid not null references etf_master(id) on delete cascade,
  price_date date not null,
  open numeric(18,6) not null,
  high numeric(18,6) not null,
  low numeric(18,6) not null,
  close numeric(18,6) not null,
  adjusted_close numeric(18,6) not null,
  volume bigint not null default 0,
  source_id text not null references etf_source_lineage(source_id),
  evidence text not null,
  primary key (fund_id, price_date, source_id)
);
create index if not exists etf_price_history_date_idx on etf_price_history(price_date desc);

create table if not exists etf_nav_history (
  fund_id uuid not null references etf_master(id) on delete cascade,
  nav_date date not null,
  nav numeric(18,6) not null,
  market_price numeric(18,6) not null,
  premium_discount_pct numeric(12,6) not null,
  source_id text not null references etf_source_lineage(source_id),
  evidence text not null,
  primary key (fund_id, nav_date, source_id)
);

create table if not exists etf_distribution_revisions (
  fund_id uuid not null references etf_master(id) on delete cascade,
  ex_date date not null,
  revision integer not null,
  amount numeric(18,8) not null,
  distribution_type text not null,
  announced_at timestamptz not null,
  supersedes_revision integer,
  source_id text not null references etf_source_lineage(source_id),
  evidence text not null,
  primary key (fund_id, ex_date, revision)
);

create table if not exists etf_holdings_snapshots (
  snapshot_id text primary key,
  fund_id uuid not null references etf_master(id) on delete cascade,
  as_of_date date not null,
  holding_count integer not null,
  reported_weight_pct numeric(9,4) not null,
  source_id text not null references etf_source_lineage(source_id),
  content_hash text not null,
  evidence text not null,
  unique (fund_id, as_of_date, source_id)
);

create table if not exists etf_corporate_actions (
  id bigint generated always as identity primary key,
  fund_id uuid not null references etf_master(id) on delete cascade,
  effective_date date not null,
  action_type text not null,
  factor numeric(18,8),
  old_value text,
  new_value text,
  source_id text not null references etf_source_lineage(source_id),
  evidence text not null
);

create table if not exists etf_ingestion_runs (
  id text primary key,
  dataset text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null,
  received integer not null default 0,
  accepted integer not null default 0,
  rejected integer not null default 0,
  warnings integer not null default 0,
  source_id text references etf_source_lineage(source_id)
);

create table if not exists etf_change_events (
  id text primary key,
  fund_id uuid not null references etf_master(id) on delete cascade,
  detected_at timestamptz not null,
  entity_type text not null,
  field_name text not null,
  previous_value jsonb,
  current_value jsonb,
  severity text not null,
  detection_rule text not null,
  resolved_at timestamptz
);
create index if not exists etf_change_events_open_idx on etf_change_events(detected_at desc) where resolved_at is null;
