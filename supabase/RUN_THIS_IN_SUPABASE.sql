-- ================================================================
-- CDI Governance System — Complete Database Setup
-- Paste this entire file into Supabase SQL Editor and click Run.
-- Safe to re-run — fully idempotent.
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- STEP 1: CORE TABLES
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.organizations (
  id              uuid primary key default gen_random_uuid(),
  domain          text not null unique,
  name            text,
  root_folder_id  text,
  setup_complete  boolean not null default false,
  workspace_links jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.meetings (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  month             integer not null check (month between 1 and 12),
  year              integer not null default extract(year from now())::integer,
  title             text not null,
  date              date,
  status            text not null default 'draft' check (status in ('draft','upcoming','in_progress','completed')),
  slide_content     jsonb not null default '{}',
  meet_link         text,
  director_script   text,
  packet_url        text,
  calendar_event_id text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (organization_id, month)
);

create table if not exists public.topics (
  id                     uuid primary key default gen_random_uuid(),
  meeting_id             uuid not null references public.meetings(id) on delete cascade,
  title                  text not null,
  sort_order             integer not null default 0,
  now_state              text not null default '',
  headed_state           text not null default '',
  brainstorm_notes       text not null default '',
  brainstorm_url         text,
  vote_url               text,
  action_plan            text not null default '',
  vote_result            text,
  carried_to_meeting_id  uuid references public.meetings(id),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  display_name    text,
  email           text,
  role            text not null default 'admin' check (role in ('owner','admin','member','viewer')),
  google_tokens   jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.attendees (
  id            uuid primary key default gen_random_uuid(),
  meeting_id    uuid not null references public.meetings(id) on delete cascade,
  user_id       uuid references auth.users(id),
  display_name  text not null,
  email         text,
  signed_in_at  timestamptz not null default now(),
  unique(meeting_id, user_id)
);

create table if not exists public.topic_votes (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null references public.topics(id) on delete cascade,
  meeting_id    uuid not null references public.meetings(id) on delete cascade,
  user_id       uuid references auth.users(id),
  display_name  text not null,
  vote          text not null check (vote in ('yes','no','abstain')),
  voted_at      timestamptz not null default now(),
  unique(topic_id, user_id)
);

create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  file_path       text not null,
  file_name       text,
  file_size       bigint,
  mime_type       text,
  description     text,
  uploaded_by     uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table if not exists public.drive_folders (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  folder_name     text not null,
  drive_id        text not null,
  parent_drive_id text,
  created_at      timestamptz not null default now()
);

create table if not exists public.templates (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  mime_type       text not null,
  drive_id        text not null,
  folder_name     text not null default '03_Templates',
  created_at      timestamptz not null default now()
);

-- Add any missing columns to existing tables (idempotent)
do $$
begin
  -- meetings
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='slide_content') then
    alter table public.meetings add column slide_content jsonb not null default '{}';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='meet_link') then
    alter table public.meetings add column meet_link text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='year') then
    alter table public.meetings add column year integer not null default extract(year from now())::integer;
  end if;
  -- topics
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='topics' and column_name='brainstorm_notes') then
    alter table public.topics add column brainstorm_notes text not null default '';
  end if;
  -- organizations
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='workspace_links') then
    alter table public.organizations add column workspace_links jsonb not null default '{}';
  end if;
  -- profiles: ensure role constraint allows 'admin'
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='organization_id') then
    alter table public.profiles add column organization_id uuid references public.organizations(id);
  end if;
end $$;

-- Indexes
create index if not exists idx_meetings_org      on public.meetings(organization_id);
create index if not exists idx_topics_meeting    on public.topics(meeting_id);
create index if not exists idx_profiles_org      on public.profiles(organization_id);
create index if not exists idx_attendees_meeting on public.attendees(meeting_id);
create index if not exists idx_votes_topic       on public.topic_votes(topic_id);
create index if not exists idx_votes_meeting     on public.topic_votes(meeting_id);
create index if not exists idx_documents_org     on public.documents(organization_id);

-- ─────────────────────────────────────────────────────────────────
-- STEP 2: ENABLE RLS
-- ─────────────────────────────────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.meetings      enable row level security;
alter table public.topics        enable row level security;
alter table public.profiles      enable row level security;
alter table public.attendees     enable row level security;
alter table public.topic_votes   enable row level security;
alter table public.documents     enable row level security;
alter table public.drive_folders enable row level security;
alter table public.templates     enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- STEP 3: HELPER FUNCTION
-- ─────────────────────────────────────────────────────────────────

create or replace function public.get_my_org_id()
returns uuid language sql stable security definer as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────
-- STEP 4: DROP ALL EXISTING POLICIES (clean slate)
-- ─────────────────────────────────────────────────────────────────

do $$
declare r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','organizations','meetings','topics','attendees','topic_votes','documents','drive_folders','templates')
  ) loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────
-- STEP 5: RLS POLICIES
-- ─────────────────────────────────────────────────────────────────

-- Profiles
create policy "Users can read own profile"   on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());
create policy "Users can insert own profile" on public.profiles for insert with check (id = auth.uid());

-- Organizations
create policy "Org members can read their org" on public.organizations for select
  using (id = public.get_my_org_id());
create policy "Org members can update their org" on public.organizations for update
  using (id = public.get_my_org_id()) with check (id = public.get_my_org_id());
create policy "Authenticated users can create orgs" on public.organizations for insert
  with check (auth.uid() is not null);

-- Meetings — all org members can read and update (for slide edits, meet link, etc.)
create policy "Org members can read meetings" on public.meetings for select
  using (organization_id = public.get_my_org_id());
create policy "Org members can update meetings" on public.meetings for update
  using (organization_id = public.get_my_org_id())
  with check (organization_id = public.get_my_org_id());
create policy "Admins can insert meetings" on public.meetings for insert
  with check (organization_id = public.get_my_org_id());

-- Topics — all org members can manage (needed for slide editing & voting)
create policy "Org members can manage topics" on public.topics for all
  using (exists (
    select 1 from public.meetings
    where meetings.id = topics.meeting_id
    and meetings.organization_id = public.get_my_org_id()
  ))
  with check (exists (
    select 1 from public.meetings
    where meetings.id = topics.meeting_id
    and meetings.organization_id = public.get_my_org_id()
  ));

-- Attendees
create policy "Org members can read attendees" on public.attendees for select
  using (exists (
    select 1 from public.meetings
    where meetings.id = attendees.meeting_id
    and meetings.organization_id = public.get_my_org_id()
  ));
create policy "Auth users can sign in to meeting" on public.attendees for insert
  with check (auth.uid() = user_id);
create policy "Users can update own sign-in" on public.attendees for update
  using (auth.uid() = user_id);
create policy "Users can remove own sign-in" on public.attendees for delete
  using (auth.uid() = user_id);

-- Topic votes
create policy "Org members can read topic votes" on public.topic_votes for select
  using (exists (
    select 1 from public.meetings
    where meetings.id = topic_votes.meeting_id
    and meetings.organization_id = public.get_my_org_id()
  ));
create policy "Auth users can cast vote" on public.topic_votes for insert
  with check (auth.uid() = user_id);
create policy "Users can update own vote" on public.topic_votes for update
  using (auth.uid() = user_id);

-- Documents
create policy "Org members can read documents" on public.documents for select
  using (organization_id = public.get_my_org_id());
create policy "Org members can manage documents" on public.documents for all
  using (organization_id = public.get_my_org_id())
  with check (organization_id = public.get_my_org_id());

-- Drive folders
create policy "Org members can read drive folders" on public.drive_folders for select
  using (organization_id = public.get_my_org_id());

-- Templates
create policy "Org members can read templates" on public.templates for select
  using (organization_id = public.get_my_org_id());

-- ─────────────────────────────────────────────────────────────────
-- STEP 6: FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_organizations_updated_at on public.organizations;
drop trigger if exists set_meetings_updated_at      on public.meetings;
drop trigger if exists set_topics_updated_at        on public.topics;
drop trigger if exists set_profiles_updated_at      on public.profiles;

create trigger set_organizations_updated_at before update on public.organizations for each row execute function public.handle_updated_at();
create trigger set_meetings_updated_at      before update on public.meetings      for each row execute function public.handle_updated_at();
create trigger set_topics_updated_at        before update on public.topics        for each row execute function public.handle_updated_at();
create trigger set_profiles_updated_at      before update on public.profiles      for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    'admin'
  )
  on conflict (id) do update set
    email        = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed 12 meetings for a new org
create or replace function public.seed_meetings(p_org_id uuid, p_start_year integer default extract(year from now())::integer)
returns void language plpgsql security definer as $$
declare
  v_month integer;
  v_names text[] := array['January','February','March','April','May','June','July','August','September','October','November','December'];
begin
  for v_month in 1..12 loop
    insert into public.meetings (organization_id, month, year, title, date, status)
    values (
      p_org_id, v_month, p_start_year,
      'Board Meeting — ' || v_names[v_month] || ' ' || p_start_year,
      make_date(p_start_year, v_month, 15),
      case when v_month = extract(month from now())::integer then 'upcoming' else 'draft' end
    )
    on conflict (organization_id, month) do nothing;
  end loop;
end; $$;

-- Get or create org + profile on first sign-in
create or replace function public.get_or_create_org(
  p_domain        text,
  p_email         text,
  p_display_name  text
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_org  public.organizations;
  v_uid  uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select * into v_org from public.organizations where domain = p_domain;
  if not found then
    insert into public.organizations (domain, name, setup_complete)
    values (p_domain, p_domain, true)
    returning * into v_org;
    perform public.seed_meetings(v_org.id);
  end if;

  insert into public.profiles (id, organization_id, email, display_name, role)
  values (v_uid, v_org.id, p_email, p_display_name, 'admin')
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    email           = excluded.email,
    display_name    = excluded.display_name,
    role            = 'admin';

  return row_to_json(v_org);
end; $$;

grant execute on function public.get_or_create_org(text, text, text) to authenticated;

-- Close meeting and carry voted topics forward to next month
create or replace function public.close_meeting(p_meeting_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_org_id        uuid;
  v_current_month integer;
  v_next_id       uuid;
  v_count         integer := 0;
begin
  select organization_id, month into v_org_id, v_current_month
  from public.meetings where id = p_meeting_id;
  if not found then raise exception 'Meeting not found'; end if;

  select id into v_next_id from public.meetings
  where organization_id = v_org_id
    and month = case when v_current_month = 12 then 1 else v_current_month + 1 end;

  if v_next_id is not null then
    insert into public.topics (meeting_id, title, now_state, headed_state, sort_order)
    select v_next_id, t.title, t.action_plan, t.vote_result, t.sort_order
    from public.topics t
    where t.meeting_id = p_meeting_id and t.vote_result is not null and t.vote_result <> '';
    get diagnostics v_count = row_count;

    update public.topics set carried_to_meeting_id = v_next_id
    where meeting_id = p_meeting_id and vote_result is not null and vote_result <> '';
  end if;

  update public.meetings set status = 'completed' where id = p_meeting_id;
  return jsonb_build_object('success', true, 'carried_topics', v_count, 'next_meeting_id', v_next_id);
end; $$;

-- ─────────────────────────────────────────────────────────────────
-- STEP 7: REALTIME
-- ─────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'attendees'
  ) then
    alter publication supabase_realtime add table public.attendees;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'topic_votes'
  ) then
    alter publication supabase_realtime add table public.topic_votes;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────
-- Done! All tables, policies, and functions are ready.
-- ─────────────────────────────────────────────────────────────────
