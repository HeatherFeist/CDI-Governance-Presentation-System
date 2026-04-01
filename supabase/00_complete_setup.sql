-- ============================================
-- CDI Governance Presentation System
-- Complete Supabase Setup (run as one script)
-- Safe to re-run — fully idempotent
-- ============================================

-- =====================
-- STEP 1: CORE TABLES
-- =====================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text,
  root_folder_id text,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetings (
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

create table if not exists public.topics (
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

create table if not exists public.drive_folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  folder_name text not null,
  drive_id text not null,
  parent_drive_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  mime_type text not null,
  drive_id text not null,
  folder_name text not null default '03_Templates',
  created_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  form_id text not null,
  form_url text,
  created_at timestamptz not null default now()
);

-- Profiles: create if new, or add missing columns if table exists from another app
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  display_name text,
  email text,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  google_tokens jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If profiles already existed, add any missing columns
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'organization_id') then
    alter table public.profiles add column organization_id uuid references public.organizations(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'google_tokens') then
    alter table public.profiles add column google_tokens jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'display_name') then
    alter table public.profiles add column display_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'created_at') then
    alter table public.profiles add column created_at timestamptz not null default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'updated_at') then
    alter table public.profiles add column updated_at timestamptz not null default now();
  end if;
end $$;

-- Indexes
create index if not exists idx_meetings_org on public.meetings(organization_id);
create index if not exists idx_meetings_status on public.meetings(status);
create index if not exists idx_topics_meeting on public.topics(meeting_id);
create index if not exists idx_drive_folders_org on public.drive_folders(organization_id);
create index if not exists idx_profiles_org on public.profiles(organization_id);

-- =====================
-- STEP 2: RLS POLICIES
-- =====================

alter table public.organizations enable row level security;
alter table public.meetings enable row level security;
alter table public.topics enable row level security;
alter table public.drive_folders enable row level security;
alter table public.templates enable row level security;
alter table public.forms enable row level security;
alter table public.profiles enable row level security;

-- Helper function
create or replace function public.get_my_org_id()
returns uuid
language sql
stable
security definer
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- Drop existing policies first (safe re-run)
do $$
declare
  r record;
begin
  for r in (
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','organizations','meetings','topics','drive_folders','templates','forms')
      and policyname in (
        'Users can read own profile','Users can update own profile','Users can insert own profile',
        'Org members can read their org','Owners can update their org','Authenticated users can create orgs',
        'Org members can read meetings','Admins can insert meetings','Admins can update meetings',
        'Org members can read topics','Admins can manage topics',
        'Org members can read drive folders','Admins can manage drive folders',
        'Org members can read templates','Admins can manage templates',
        'Org members can read forms','Admins can manage forms'
      )
  ) loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- Organizations
create policy "Org members can read their org"
  on public.organizations for select
  using (id = public.get_my_org_id());

create policy "Owners can update their org"
  on public.organizations for update
  using (
    id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

create policy "Authenticated users can create orgs"
  on public.organizations for insert
  with check (auth.uid() is not null);

-- Meetings
create policy "Org members can read meetings"
  on public.meetings for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can insert meetings"
  on public.meetings for insert
  with check (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

create policy "Admins can update meetings"
  on public.meetings for update
  using (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Topics
create policy "Org members can read topics"
  on public.topics for select
  using (
    exists (
      select 1 from public.meetings
      where meetings.id = topics.meeting_id
      and meetings.organization_id = public.get_my_org_id()
    )
  );

create policy "Admins can manage topics"
  on public.topics for all
  using (
    exists (
      select 1 from public.meetings
      join public.profiles on profiles.organization_id = meetings.organization_id
      where meetings.id = topics.meeting_id
      and profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Drive folders
create policy "Org members can read drive folders"
  on public.drive_folders for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can manage drive folders"
  on public.drive_folders for all
  using (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Templates
create policy "Org members can read templates"
  on public.templates for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can manage templates"
  on public.templates for all
  using (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Forms
create policy "Org members can read forms"
  on public.forms for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can manage forms"
  on public.forms for all
  using (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- ============================
-- STEP 3: FUNCTIONS & TRIGGERS
-- ============================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Drop triggers first so we can recreate them
drop trigger if exists set_organizations_updated_at on public.organizations;
drop trigger if exists set_meetings_updated_at on public.meetings;
drop trigger if exists set_topics_updated_at on public.topics;
drop trigger if exists set_profiles_updated_at on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger set_meetings_updated_at
  before update on public.meetings
  for each row execute function public.handle_updated_at();

create trigger set_topics_updated_at
  before update on public.topics
  for each row execute function public.handle_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Close meeting and carry voted topics forward
create or replace function public.close_meeting(p_meeting_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_org_id uuid;
  v_current_month integer;
  v_next_meeting_id uuid;
  v_carried_count integer := 0;
begin
  select organization_id, month
  into v_org_id, v_current_month
  from public.meetings
  where id = p_meeting_id;

  if not found then
    raise exception 'Meeting not found';
  end if;

  select id into v_next_meeting_id
  from public.meetings
  where organization_id = v_org_id
    and month = case when v_current_month = 12 then 1 else v_current_month + 1 end;

  if v_next_meeting_id is not null then
    insert into public.topics (meeting_id, title, now_state, headed_state, sort_order)
    select
      v_next_meeting_id,
      t.title,
      t.action_plan,
      t.vote_result,
      t.sort_order
    from public.topics t
    where t.meeting_id = p_meeting_id
      and t.vote_result is not null
      and t.vote_result != '';

    get diagnostics v_carried_count = row_count;

    update public.topics
    set carried_to_meeting_id = v_next_meeting_id
    where meeting_id = p_meeting_id
      and vote_result is not null
      and vote_result != '';
  end if;

  update public.meetings
  set status = 'completed'
  where id = p_meeting_id;

  return jsonb_build_object(
    'success', true,
    'carried_topics', v_carried_count,
    'next_meeting_id', v_next_meeting_id
  );
end;
$$;

-- Seed 12 meetings for an organization
create or replace function public.seed_meetings(p_org_id uuid, p_start_year integer default extract(year from now())::integer)
returns void
language plpgsql
security definer
as $$
declare
  v_month integer;
  v_month_names text[] := array[
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
begin
  for v_month in 1..12 loop
    insert into public.meetings (organization_id, month, title, date, status)
    values (
      p_org_id,
      v_month,
      'Board Meeting - ' || v_month_names[v_month] || ' ' || p_start_year,
      make_date(p_start_year, v_month, 15),
      case when v_month = 1 then 'upcoming' else 'draft' end
    )
    on conflict (organization_id, month) do nothing;
  end loop;
end;
$$;

-- =====================
-- STEP 4: SEED DATA
-- =====================

create table if not exists public.slide_types (
  type text primary key,
  label text not null,
  sort_order integer not null,
  description text
);

insert into public.slide_types (type, label, sort_order, description) values
  ('intro',    'Introduction',           1, 'Welcome and meeting opening'),
  ('mission',  'Mission & Grounding',    2, 'Ground the room in organizational purpose'),
  ('snapshot', 'Current Snapshot',       3, 'Where we are right now — data and status'),
  ('vision',   'Vision',                 4, 'Where we are headed — goals and aspirations'),
  ('topic',    'Discussion Topic',       5, '4-step governance arc: Now → Headed → Brainstorm → Vote'),
  ('mentor',   'Mentor Feedback',        6, 'Display mentor feedback and insights'),
  ('chapter',  'Chapter Progress',       7, 'Chapter writing and development progress'),
  ('closing',  'Closing & Next Steps',   8, 'Summary, decisions, and carry-forward to next month')
on conflict (type) do nothing;

create table if not exists public.template_definitions (
  id serial primary key,
  name text not null,
  mime_type text not null,
  folder text not null default '03_Templates'
);

insert into public.template_definitions (name, mime_type)
select * from (values
  ('Agenda_Template',            'application/vnd.google-apps.document'),
  ('Minutes_Template',           'application/vnd.google-apps.document'),
  ('Chapter_Writing_Template',   'application/vnd.google-apps.document'),
  ('Mentor_Onboarding_Template', 'application/vnd.google-apps.document'),
  ('Board_Onboarding_Template',  'application/vnd.google-apps.document'),
  ('Action_Tracker_Template',    'application/vnd.google-apps.spreadsheet')
) as t(name, mime_type)
where not exists (select 1 from public.template_definitions);

create table if not exists public.form_definitions (
  id serial primary key,
  name text not null
);

insert into public.form_definitions (name)
select * from (values
  ('Voting_Form_Template'),
  ('Brainstorm_Form_Template'),
  ('Mentor_Feedback_Form')
) as t(name)
where not exists (select 1 from public.form_definitions);

create table if not exists public.folder_definitions (
  id serial primary key,
  name text not null,
  parent_name text
);

insert into public.folder_definitions (name, parent_name)
select * from (values
  ('CDI Governance System', null::text),
  ('01_Yearly_Cycle',       'CDI Governance System'),
  ('02_Meeting_Packets',    'CDI Governance System'),
  ('03_Templates',          'CDI Governance System'),
  ('04_Mentor_Feedback',    'CDI Governance System'),
  ('05_Chapter_Writing',    'CDI Governance System'),
  ('06_Archives',           'CDI Governance System')
) as t(name, parent_name)
where not exists (select 1 from public.folder_definitions);
