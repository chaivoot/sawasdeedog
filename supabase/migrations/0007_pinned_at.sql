-- When a place was last pinned: the latest pin goes first among a category's
-- pinned listings. Set by the admin editor whenever a pin is added.
-- Run once in the Supabase SQL editor after 0006_pins.sql.

alter table public.places
  add column if not exists pinned_at timestamptz;
