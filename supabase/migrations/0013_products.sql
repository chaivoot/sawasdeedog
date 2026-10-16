-- Dog items ("ไอเทมน้องหมา") the trainers recommend. Like articles, only the server
-- (service-role key) reads or writes them. Safe to run more than once.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  -- Slugs from src/data/item-categories.ts.
  category text not null check (category ~ '^[a-z]+$'),
  subcategory text check (subcategory ~ '^[a-z]+$'),
  image_url text,
  price_note text,
  -- Why the trainer picked it, from their own use.
  reason text,
  recommended_by text,
  buy_url text,
  sort integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists products_published_idx on public.products (category, sort) where published;

alter table public.products enable row level security;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
