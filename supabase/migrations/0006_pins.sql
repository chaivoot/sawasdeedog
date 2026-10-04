-- Pinned listings: the categories a place is pinned in, shown first on that
-- category's list (up to 6 per category, enforced by the admin editor).
-- Run once in the Supabase SQL editor after 0005_stay_weight.sql.

alter table public.places
  add column if not exists pinned_in text[] not null default '{}';
