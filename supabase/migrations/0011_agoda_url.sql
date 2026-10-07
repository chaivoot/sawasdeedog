-- Stays: the place's Agoda page, shown as a "check room prices" button. The partner
-- id (AGODA_CID) is added when the page renders, so it is not stored here.
-- Safe to run more than once.
alter table public.places add column if not exists agoda_url text;
