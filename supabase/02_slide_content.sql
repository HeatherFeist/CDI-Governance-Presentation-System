-- Migration: Add slide_content to meetings
-- Stores per-slide customizations (title, subtitle, content, image_url)
-- Run in Supabase SQL Editor

alter table public.meetings
  add column if not exists slide_content jsonb not null default '{}';
