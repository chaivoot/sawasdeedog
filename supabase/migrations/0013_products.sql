-- Dog products ("หมาเราต้องมี"), picked by the team and linked to Shopee with our
-- affiliate link. Like places, only the server (service-role key) reads or writes
-- them. Safe to run more than once.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- One of the groups in src/data/shopping.ts.
  group_slug text not null,
  -- Why we picked it, shown on the card.
  reason text,
  image_url text,
  shopee_url text not null,
  -- Lower comes first within its group.
  sort integer not null default 0,
  checked_at date not null default current_date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists products_published_idx on public.products (group_slug, sort) where published;

alter table public.products enable row level security;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
