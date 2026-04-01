-- ─────────────────────────────────────────────────────────────────────────────
-- 04_upgrades.sql
-- Run this in the Supabase SQL Editor after 00, 01, 02, 03 have been run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Add brainstorm_notes to topics
-- Stores ideas captured during the Brainstorm step of the topic micro-cycle
alter table public.topics
  add column if not exists brainstorm_notes text not null default '';

-- Add workspace_links to organizations
-- Stores Google Workspace file URLs created from the Templates panel
-- Format: { "agenda": "https://docs.google.com/...", "action_tracker": "...", ... }
alter table public.organizations
  add column if not exists workspace_links jsonb not null default '{}';

-- Verify
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('topics', 'organizations')
  and column_name in ('brainstorm_notes', 'workspace_links')
order by table_name, column_name;
