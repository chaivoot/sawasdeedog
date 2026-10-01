-- SawasDeeDog schema. Run once in the Supabase SQL editor (or `supabase db push`).
-- The site talks to Supabase only from the server with the service-role key, so
-- RLS is enabled with no policies: the public anon key can read/write nothing.

create extension if not exists pgcrypto;

-- Listings shown on the site ------------------------------------------------
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category text not null,
  type text,
  trainer_style text check (trainer_style in ('rplus', 'balance')),
  province text not null,
  district text,
  checked_at date not null default current_date,
  description text,
  attributes text[] not null default '{}',
  hours text,
  price text,
  phone text,
  line text,
  instagram text,
  facebook text,
  website text,
  maps_url text not null,
  photos text[] not null default '{}',
  breeds text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists places_listing_idx on public.places (category, province, district) where published;
create index if not exists places_breeds_idx on public.places using gin (breeds) where published;

-- Suggestions and error reports from signed-in LINE users --------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new', 'report')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'resolved')),
  -- new: { name, category, mapsUrl, province, district?, note? }
  -- report: { placeName, details }
  payload jsonb not null,
  place_slug text,
  photos text[] not null default '{}',
  submitted_by_sub text not null,
  submitted_by_name text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  review_note text
);

create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

alter table public.places enable row level security;
alter table public.submissions enable row level security;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists places_touch on public.places;
create trigger places_touch before update on public.places
  for each row execute function public.touch_updated_at();

-- Storage --------------------------------------------------------------------
-- place-photos: public, shown on the site.
-- submission-photos: private, only admins see them (via signed URLs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('place-photos', 'place-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('submission-photos', 'submission-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
