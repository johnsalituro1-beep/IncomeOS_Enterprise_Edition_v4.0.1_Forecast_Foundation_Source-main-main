create table if not exists copilot_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists copilot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references copilot_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  intent text,
  content jsonb not null,
  confidence numeric,
  created_at timestamptz not null default now()
);
create table if not exists copilot_evidence (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references copilot_messages(id) on delete cascade,
  source_id text not null,
  label text not null,
  evidence_class text not null check (evidence_class in ('verified','provider','modeled','user-input')),
  as_of text,
  payload jsonb not null default '{}'::jsonb
);
create table if not exists advisor_findings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid,
  severity text not null check (severity in ('opportunity','watch','critical')),
  title text not null,
  explanation text not null,
  impact text,
  proposed_action jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create table if not exists decision_studio_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid,
  digital_twin_scenario_id uuid,
  prompt text not null,
  assumptions jsonb not null,
  baseline_results jsonb not null,
  scenario_results jsonb not null,
  tradeoffs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table copilot_conversations enable row level security;
alter table copilot_messages enable row level security;
alter table copilot_evidence enable row level security;
alter table advisor_findings enable row level security;
alter table decision_studio_runs enable row level security;
create policy "own conversations" on copilot_conversations for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own advisor findings" on advisor_findings for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own decision runs" on decision_studio_runs for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
