-- Star ratings (1-5). One rating per LINE user per place; users may change it.
-- Run once in the Supabase SQL editor after 0001_init.sql.

create table if not exists public.place_ratings (
  place_id uuid not null references public.places (id) on delete cascade,
  user_sub text not null,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The primary key is what makes "rate only once" hold even under double clicks.
  primary key (place_id, user_sub)
);

alter table public.place_ratings enable row level security;

drop trigger if exists place_ratings_touch on public.place_ratings;
create trigger place_ratings_touch before update on public.place_ratings
  for each row execute function public.touch_updated_at();

-- Aggregates for listing pages. security_invoker keeps RLS in force, so the
-- public anon key can't read this view either; the site reads it server-side.
create or replace view public.place_rating_stats
with (security_invoker = true) as
select place_id, count(*)::int as rating_count, round(avg(stars)::numeric, 1)::float as rating_avg
from public.place_ratings
group by place_id;
