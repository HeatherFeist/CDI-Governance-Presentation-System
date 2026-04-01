-- ============================================
-- CDI Governance Presentation System
-- 04: Seed Data (optional — starter templates)
-- ============================================

-- Default slide types for reference
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

-- Default template names for the Google Drive setup
create table if not exists public.template_definitions (
  id serial primary key,
  name text not null,
  mime_type text not null,
  folder text not null default '03_Templates'
);

insert into public.template_definitions (name, mime_type) values
  ('Agenda_Template',            'application/vnd.google-apps.document'),
  ('Minutes_Template',           'application/vnd.google-apps.document'),
  ('Chapter_Writing_Template',   'application/vnd.google-apps.document'),
  ('Mentor_Onboarding_Template', 'application/vnd.google-apps.document'),
  ('Board_Onboarding_Template',  'application/vnd.google-apps.document'),
  ('Action_Tracker_Template',    'application/vnd.google-apps.spreadsheet');

-- Default form names
create table if not exists public.form_definitions (
  id serial primary key,
  name text not null
);

insert into public.form_definitions (name) values
  ('Voting_Form_Template'),
  ('Brainstorm_Form_Template'),
  ('Mentor_Feedback_Form');

-- Default folder structure
create table if not exists public.folder_definitions (
  id serial primary key,
  name text not null,
  parent_name text
);

insert into public.folder_definitions (name, parent_name) values
  ('CDI Governance System', null),
  ('01_Yearly_Cycle',       'CDI Governance System'),
  ('02_Meeting_Packets',    'CDI Governance System'),
  ('03_Templates',          'CDI Governance System'),
  ('04_Mentor_Feedback',    'CDI Governance System'),
  ('05_Chapter_Writing',    'CDI Governance System'),
  ('06_Archives',           'CDI Governance System');
