-- Stays: an affiliate booking link (an Involve Asia short link such as invl.me/…, or a
-- Traveloka, Trip.com or Booking.com page). Shown as the "check room prices" button in
-- place of the Agoda one. Safe to run more than once.
alter table public.places add column if not exists booking_url text;
