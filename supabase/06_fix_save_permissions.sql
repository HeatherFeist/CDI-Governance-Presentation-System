-- ============================================================
-- 06_fix_save_permissions.sql
-- Fix: allow all org members (not just admins) to update topics
-- and meetings (slide_content). Run in Supabase SQL Editor.
-- ============================================================

-- Drop the admin-only policies
drop policy if exists "Admins can manage topics" on public.topics;
drop policy if exists "Admins can update meetings" on public.meetings;
drop policy if exists "Admins can insert meetings" on public.meetings;

-- Topics: all org members can insert/update/delete topics in their org's meetings
create policy "Org members can manage topics"
  on public.topics for all
  using (
    exists (
      select 1 from public.meetings
      where meetings.id = topics.meeting_id
      and meetings.organization_id = public.get_my_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.meetings
      where meetings.id = topics.meeting_id
      and meetings.organization_id = public.get_my_org_id()
    )
  );

-- Meetings: all org members can update meetings in their org (e.g. slide_content, meet_link)
create policy "Org members can update meetings"
  on public.meetings for update
  using (organization_id = public.get_my_org_id())
  with check (organization_id = public.get_my_org_id());

-- Meetings: only admins can insert new meetings
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
