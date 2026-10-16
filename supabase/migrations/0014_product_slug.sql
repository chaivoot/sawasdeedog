-- Each item gets its own page (/items/<category>/<slug>). Items saved before this
-- have no slug and are linked by id until they are next saved. Safe to run more than once.
alter table public.products add column if not exists slug text;
create unique index if not exists products_slug_key on public.products (slug);
