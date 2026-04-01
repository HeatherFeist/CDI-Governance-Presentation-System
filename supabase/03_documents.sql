-- Migration: Organization Documents
-- Run this in Supabase SQL Editor

-- 1. Documents table
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name          text not null,
  description   text,
  file_path     text not null,   -- storage path: org_id/filename
  file_name     text not null,   -- original file name
  file_size     bigint,
  mime_type     text,
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index if not exists idx_documents_org on public.documents(organization_id);

-- 2. RLS
alter table public.documents enable row level security;

-- Drop if re-running
do $$
declare
  r record;
begin
  for r in (
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename = 'documents'
    and policyname in (
      'Org members can read documents',
      'Admins can upload documents',
      'Admins can delete documents'
    )
  ) loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "Org members can read documents"
  on public.documents for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can upload documents"
  on public.documents for insert
  with check (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

create policy "Admins can delete documents"
  on public.documents for delete
  using (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- 3. Storage bucket (run separately if this errors — Supabase may need it via Dashboard)
-- Go to Storage → New bucket → name: "org-documents", Public: OFF
-- Then add these policies in the Storage policies tab:
--
--   Allow authenticated read:
--     bucket_id = 'org-documents' AND auth.uid() IS NOT NULL
--
--   Allow admin upload:
--     bucket_id = 'org-documents' AND auth.uid() IS NOT NULL
--
-- OR simply run:

insert into storage.buckets (id, name, public)
values ('org-documents', 'org-documents', false)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Org members can read org-documents"
  on storage.objects for select
  using (
    bucket_id = 'org-documents'
    and auth.uid() is not null
  );

create policy "Admins can upload to org-documents"
  on storage.objects for insert
  with check (
    bucket_id = 'org-documents'
    and auth.uid() is not null
  );

create policy "Admins can delete from org-documents"
  on storage.objects for delete
  using (
    bucket_id = 'org-documents'
    and auth.uid() is not null
  );
