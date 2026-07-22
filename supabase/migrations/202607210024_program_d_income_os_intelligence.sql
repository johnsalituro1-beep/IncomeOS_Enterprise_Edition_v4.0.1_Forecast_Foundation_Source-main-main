-- Program D Version 24: Income Operating System Intelligence
create table if not exists income_os_component_definitions (
  key text primary key,
  label text not null,
  default_weight numeric not null check (default_weight >= 0),
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists income_os_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid,
  overall_score numeric not null check (overall_score between 0 and 100),
  confidence numeric not null check (confidence between 0 and 100),
  health text not null check (health in ('excellent','strong','watch','at-risk')),
  input_snapshot jsonb not null,
  generated_at timestamptz not null default now()
);
create table if not exists income_os_component_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references income_os_assessments(id) on delete cascade,
  component_key text not null references income_os_component_definitions(key),
  score numeric not null check (score between 0 and 100),
  confidence numeric not null check (confidence between 0 and 100),
  direction text not null check (direction in ('improving','stable','declining')),
  factors jsonb not null default '[]'::jsonb,
  unique(assessment_id, component_key)
);
create table if not exists income_os_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid references income_os_assessments(id) on delete cascade,
  priority text not null check (priority in ('critical','high','medium','low')),
  category text not null,
  title text not null,
  rationale text not null,
  estimated_impact numeric,
  reason_codes text[] not null default '{}',
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create table if not exists income_os_evidence_links (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references income_os_recommendations(id) on delete cascade,
  assessment_id uuid references income_os_assessments(id) on delete cascade,
  evidence_class text not null check (evidence_class in ('verified','provider','modeled','user','missing')),
  source_type text not null,
  source_ref text,
  confidence numeric check (confidence between 0 and 100),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table income_os_assessments enable row level security;
alter table income_os_recommendations enable row level security;
create policy "users read own income os assessments" on income_os_assessments for select using (auth.uid() = user_id);
create policy "users insert own income os assessments" on income_os_assessments for insert with check (auth.uid() = user_id);
create policy "users read own income os recommendations" on income_os_recommendations for select using (auth.uid() = user_id);
create policy "users update own income os recommendations" on income_os_recommendations for update using (auth.uid() = user_id);
