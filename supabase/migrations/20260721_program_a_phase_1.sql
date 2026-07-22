-- Program A Phase 1 intelligence entities
create table if not exists etf_normalized_exposures (
  id bigint generated always as identity primary key,
  etf_id text not null,
  as_of_date date not null,
  dimension text not null check (dimension in ('sector','industry','country','market-cap','factor','asset-class')),
  name text not null,
  weight_pct numeric not null check (weight_pct >= 0 and weight_pct <= 100),
  evidence text not null,
  unique (etf_id, as_of_date, dimension, name)
);

create table if not exists etf_scorecards (
  id bigint generated always as identity primary key,
  etf_id text not null,
  methodology_version text not null,
  overall_score numeric not null check (overall_score between 0 and 100),
  components jsonb not null,
  generated_at timestamptz not null default now()
);

create table if not exists etf_issuer_profiles (
  issuer text primary key,
  active_fund_count integer not null default 0,
  strategies jsonb not null default '[]'::jsonb,
  asset_classes jsonb not null default '[]'::jsonb,
  total_aum_usd numeric,
  evidence text not null,
  updated_at timestamptz not null default now()
);

create table if not exists etf_benchmark_profiles (
  benchmark text primary key,
  fund_ids jsonb not null default '[]'::jsonb,
  strategy_families jsonb not null default '[]'::jsonb,
  asset_classes jsonb not null default '[]'::jsonb,
  evidence text not null,
  updated_at timestamptz not null default now()
);

create table if not exists etf_research_metadata (
  etf_id text primary key,
  portfolio_role text not null,
  income_characteristics text not null,
  growth_characteristics text not null,
  risk_notes jsonb not null default '[]'::jsonb,
  research_status text not null check (research_status in ('ready','partial','blocked')),
  provider_confidence numeric not null check (provider_confidence between 0 and 100),
  last_validation_date date not null,
  evidence text not null,
  updated_at timestamptz not null default now()
);
