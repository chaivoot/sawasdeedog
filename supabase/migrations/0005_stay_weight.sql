-- Stays: the heaviest dog a place takes, shown as a warning ("รับน้องหมาไม่เกิน 25 กก.").
-- Empty means no weight limit. Stays that take only dogs under 15 kg are not listed.
-- Run once in the Supabase SQL editor after 0004_locations.sql.

alter table public.places
  add column if not exists max_dog_kg integer check (max_dog_kg is null or max_dog_kg > 0);
