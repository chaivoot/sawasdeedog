-- A place can appear in more than one category, e.g. a vet clinic that also
-- grooms. `category` stays the main one (breadcrumb, structured data); the
-- others go here. Run once in the Supabase SQL editor after 0002_ratings.sql.

alter table public.places
  add column if not exists extra_categories text[] not null default '{}';

create index if not exists places_extra_categories_idx
  on public.places using gin (extra_categories) where published;
