-- ============================================
-- CDI Governance Presentation System
-- 02: Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.meetings enable row level security;
alter table public.topics enable row level security;
alter table public.drive_folders enable row level security;
alter table public.templates enable row level security;
alter table public.forms enable row level security;
alter table public.profiles enable row level security;

-- Helper: get the current user's organization_id
create or replace function public.get_my_org_id()
returns uuid
language sql
stable
security definer
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- PROFILES
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- ORGANIZATIONS
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

-- MEETINGS
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

-- TOPICS
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

-- DRIVE FOLDERS
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

-- TEMPLATES
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

-- FORMS
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
