-- Stays: the heaviest dog a place takes and how many dogs per room, both shown
-- as warnings ("จำกัดน้ำหนักน้องหมาไม่เกิน 25 กก.", "ไม่เกิน 2 ตัวต่อห้อง").
-- Empty means no limit. Stays that take only dogs under 15 kg are not listed.
-- Run once in the Supabase SQL editor after 0004_locations.sql.

alter table public.places
  add column if not exists max_dog_kg integer check (max_dog_kg is null or max_dog_kg > 0),
  add column if not exists max_dogs integer check (max_dogs is null or max_dogs > 0);
