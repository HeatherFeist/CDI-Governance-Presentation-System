-- ============================================
-- CDI Governance: Attendance & Live Voting
-- 05: Attendees, Topic Votes, Meet Link
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add meet_link to meetings
alter table public.meetings
  add column if not exists meet_link text;

-- 2. Attendees table — who signed in and when
create table if not exists public.attendees (
  id            uuid primary key default gen_random_uuid(),
  meeting_id    uuid not null references public.meetings(id) on delete cascade,
  user_id       uuid references auth.users(id),
  display_name  text not null,
  email         text,
  signed_in_at  timestamptz not null default now(),
  unique(meeting_id, user_id)
);

create index if not exists idx_attendees_meeting on public.attendees(meeting_id);

-- 3. Topic votes table — per-person vote per topic
create table if not exists public.topic_votes (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null references public.topics(id) on delete cascade,
  meeting_id    uuid not null references public.meetings(id) on delete cascade,
  user_id       uuid references auth.users(id),
  display_name  text not null,
  vote          text not null check (vote in ('yes', 'no', 'abstain')),
  voted_at      timestamptz not null default now(),
  unique(topic_id, user_id)
);

create index if not exists idx_topic_votes_topic on public.topic_votes(topic_id);
create index if not exists idx_topic_votes_meeting on public.topic_votes(meeting_id);

-- 4. RLS — Attendees
alter table public.attendees enable row level security;

do $$
declare r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename = 'attendees'
    and policyname in (
      'Org members can read attendees',
      'Auth users can sign in to meeting',
      'Users can remove own sign-in'
    )
  ) loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "Org members can read attendees"
  on public.attendees for select
  using (
    exists (
      select 1 from public.meetings
      where meetings.id = attendees.meeting_id
      and meetings.organization_id = public.get_my_org_id()
    )
  );

create policy "Auth users can sign in to meeting"
  on public.attendees for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own sign-in"
  on public.attendees for delete
  using (auth.uid() = user_id);

-- 5. RLS — Topic Votes
alter table public.topic_votes enable row level security;

do $$
declare r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename = 'topic_votes'
    and policyname in (
      'Org members can read topic votes',
      'Auth users can cast vote',
      'Users can update own vote'
    )
  ) loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "Org members can read topic votes"
  on public.topic_votes for select
  using (
    exists (
      select 1 from public.meetings
      where meetings.id = topic_votes.meeting_id
      and meetings.organization_id = public.get_my_org_id()
    )
  );

create policy "Auth users can cast vote"
  on public.topic_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own vote"
  on public.topic_votes for update
  using (auth.uid() = user_id);

-- 6. Enable Realtime so all clients get live updates
alter publication supabase_realtime add table public.attendees;
alter publication supabase_realtime add table public.topic_votes;
