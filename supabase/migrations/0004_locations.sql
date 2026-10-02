-- Places without a storefront (trainers who visit, pet sitters, transport):
-- the Google Maps link becomes optional, and service_areas lists where they
-- go. Storefront coordinates power "ใกล้ฉัน" (near me).
-- Run once in the Supabase SQL editor after 0003_extra_categories.sql.

alter table public.places alter column maps_url drop not null;

-- "bangkok" = the whole province, "bangkok/lat-krabang" = one district.
alter table public.places
  add column if not exists service_areas text[] not null default '{}';

alter table public.places
  add column if not exists lat double precision,
  add column if not exists lng double precision;
