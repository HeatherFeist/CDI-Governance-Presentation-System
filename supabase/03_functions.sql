-- ============================================
-- CDI Governance Presentation System
-- 03: Functions & Triggers
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Close meeting: carry voted topics to next month
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
  -- Get current meeting info
  select organization_id, month
  into v_org_id, v_current_month
  from public.meetings
  where id = p_meeting_id;

  if not found then
    raise exception 'Meeting not found';
  end if;

  -- Find next month's meeting
  select id into v_next_meeting_id
  from public.meetings
  where organization_id = v_org_id
    and month = case when v_current_month = 12 then 1 else v_current_month + 1 end;

  -- If next meeting exists, carry voted topics forward
  if v_next_meeting_id is not null then
    -- Create new topics in next meeting from voted items
    insert into public.topics (meeting_id, title, now_state, headed_state, sort_order)
    select
      v_next_meeting_id,
      t.title,
      t.action_plan,        -- voted action plan becomes next month's "now"
      t.vote_result,         -- vote result becomes next month's "headed"
      t.sort_order
    from public.topics t
    where t.meeting_id = p_meeting_id
      and t.vote_result is not null
      and t.vote_result != '';

    get diagnostics v_carried_count = row_count;

    -- Mark carried topics
    update public.topics
    set carried_to_meeting_id = v_next_meeting_id
    where meeting_id = p_meeting_id
      and vote_result is not null
      and vote_result != '';
  end if;

  -- Mark meeting as completed
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

-- Setup: seed 12 meetings for an organization
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
