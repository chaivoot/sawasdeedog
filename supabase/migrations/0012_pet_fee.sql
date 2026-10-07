-- Stays: what the place charges for a dog, e.g. "ฟรี" or "500 บาท/ตัว/คืน".
-- Safe to run more than once.
alter table public.places add column if not exists pet_fee text;
