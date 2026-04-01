-- Migration: get_or_create_org
-- Run this in Supabase SQL Editor
-- Creates a security definer function that bypasses RLS for first-time org setup.

-- Step 0: Fix any stale rows where role has an invalid value (e.g. 'owner', 'member')
-- These came from earlier failed setup attempts and block all future updates.
update public.profiles
set role = 'admin'
where role not in ('admin', 'manager', 'technician', 'sales');

-- Step 1: Fix handle_new_user so its ON CONFLICT UPDATE also sanitizes bad role values
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
    email        = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    role         = case
                     when public.profiles.role not in ('admin','manager','technician','sales')
                     then 'admin'
                     else public.profiles.role
                   end;
  return new;
end;
$$;

-- Step 2: Recreate get_or_create_org with role='admin'
create or replace function public.get_or_create_org(
  p_domain       text,
  p_email        text,
  p_display_name text
)
returns json
language plpgsql
security definer   -- runs as DB owner, bypasses RLS
set search_path = public
as $$
declare
  v_org   public.organizations;
  v_uid   uuid := auth.uid();
begin
  -- Must be authenticated
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Find or create the org by domain
  select * into v_org from public.organizations where domain = p_domain;

  if not found then
    insert into public.organizations (domain, name, setup_complete)
    values (p_domain, p_domain, true)
    returning * into v_org;

    -- Seed 12 monthly meetings
    perform public.seed_meetings(v_org.id);
  end if;

  -- 2. Upsert the calling user's profile (link them to the org)
  -- 'admin' is the governance role — valid in both our RLS and the marketplace constraint
  insert into public.profiles (id, organization_id, email, display_name, first_name, last_name, role)
  values (
    v_uid,
    v_org.id,
    p_email,
    p_display_name,
    coalesce(nullif(split_part(p_display_name, ' ', 1), ''), split_part(p_email, '@', 1)),
    nullif(trim(substring(p_display_name from position(' ' in p_display_name))), ''),
    'admin'
  )
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    email           = excluded.email,
    display_name    = excluded.display_name,
    first_name      = coalesce(public.profiles.first_name, excluded.first_name),
    last_name       = coalesce(public.profiles.last_name, excluded.last_name),
    role            = 'admin';

  -- 3. Return the org as JSON
  return row_to_json(v_org);
end;
$$;

-- Allow authenticated users to call this function
grant execute on function public.get_or_create_org(text, text, text) to authenticated;
