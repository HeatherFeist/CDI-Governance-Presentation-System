-- ============================================
-- CDI Governance Presentation System
-- 01: Tables
-- ============================================

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text,
  root_folder_id text,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Meetings (12 per year per org)
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  title text not null,
  date date,
  packet_url text,
  calendar_event_id text,
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'in_progress', 'completed')),
  director_script text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, month)
);

-- Topics (N per meeting, each follows the 4-step governance arc)
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  now_state text not null default '',
  headed_state text not null default '',
  brainstorm_url text,
  vote_url text,
  action_plan text not null default '',
  vote_result text,
  carried_to_meeting_id uuid references public.meetings(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Drive folders created during setup
create table public.drive_folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  folder_name text not null,
  drive_id text not null,
  parent_drive_id text,
  created_at timestamptz not null default now()
);

-- Templates created during setup
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  mime_type text not null,
  drive_id text not null,
  folder_name text not null default '03_Templates',
  created_at timestamptz not null default now()
);

-- Forms created during setup
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  form_id text not null,
  form_url text,
  created_at timestamptz not null default now()
);

-- User profiles (linked to Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  display_name text,
  email text,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  google_tokens jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_meetings_org on public.meetings(organization_id);
create index idx_meetings_status on public.meetings(status);
create index idx_topics_meeting on public.topics(meeting_id);
create index idx_drive_folders_org on public.drive_folders(organization_id);
create index idx_profiles_org on public.profiles(organization_id);
